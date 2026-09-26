import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './prisma';
import { parseJobDescription } from './ai/parseJob';
import { generateEmbedding } from './ai/embeddings';
import { hashPassword, verifyPassword, generateToken, requireAuth, AuthRequest } from './auth';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { analyzeResumeGap } from './ai/gapAnalysis';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    const token = generateToken(user.id);

    res.status(201).json({ token, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    res.json({ token, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create an application
app.post('/applications', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { company, role, jobDescription, notes } = req.body;
    const userId = req.userId!;

    const application = await prisma.application.create({
      data: { company, role, jobDescription, notes, userId },
    });

    // Respond immediately, don't make the user wait for AI parsing
    res.status(201).json(application);

    // Parse in the background, then update the record
    if (jobDescription) {
      console.log('[BG] Starting background processing for', application.id);

      Promise.all([
        parseJobDescription(jobDescription).then((r) => {
          console.log('[BG] parseJobDescription succeeded');
          return r;
        }),
        generateEmbedding(jobDescription).then((r) => {
          console.log('[BG] generateEmbedding succeeded, length:', r.length);
          return r;
        }),
      ])
        .then(async ([parsed, embedding]) => {
          console.log('[BG] Both succeeded, updating DB...');

          await prisma.application.update({
            where: { id: application.id },
            data: {
              skills: parsed.skills,
              seniority: parsed.seniority,
              salaryRange: parsed.salaryRange,
              remotePolicy: parsed.remotePolicy,
              parseStatus: 'done',
            },
          });

          const vectorLiteral = `[${embedding.join(',')}]`;
          await prisma.$executeRawUnsafe(
            `UPDATE "Application" SET embedding = $1::vector WHERE id = $2`,
            vectorLiteral,
            application.id
          );

          console.log('[BG] DB update complete for', application.id);
        })
        .catch((err) => {
          console.error('[BG] Parsing/embedding failed:', err);
          prisma.application
            .update({
              where: { id: application.id },
              data: { parseStatus: 'failed' },
            })
            .catch((e) => console.error('[BG] Failed to mark as failed:', e));
        });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// List all applications
app.get('/applications', requireAuth, async (req: AuthRequest, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// similarity search route
app.get('/applications/:id/similar', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Confirm the target application actually belongs to this user
    const target = await prisma.application.findFirst({
      where: { id, userId },
    });
    if (!target) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const results = await prisma.$queryRawUnsafe(
      `
      SELECT id, company, role, status,
             1 - (embedding <=> (SELECT embedding FROM "Application" WHERE id = $1)) AS similarity
      FROM "Application"
      WHERE id != $1 AND embedding IS NOT NULL AND "userId" = $2
      ORDER BY embedding <=> (SELECT embedding FROM "Application" WHERE id = $1)
      LIMIT 5
      `,
      id,
      userId
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch similar applications' });
  }
});

app.post('/user/resume', requireAuth, upload.single('resume'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    await parser.destroy();

    const resumeText = result.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract readable text from this PDF' });
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: { resumeText },
    });

    res.json({ success: true, preview: resumeText.slice(0, 200) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process resume PDF' });
  }
});

app.get('/user/resume', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { resumeText: true },
    });
    res.json({ resumeText: user?.resumeText ?? null });
  } catch (err) {
    console.error(err);
   
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

app.post('/applications/:id/gap-analysis', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    const application = await prisma.application.findFirst({ where: { id, userId } });
    if (!application || !application.jobDescription) {
      return res.status(404).json({ error: 'Application or job description not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.resumeText) {
      return res.status(400).json({ error: 'No resume on file. Upload one first.' });
    }

    const analysis = await analyzeResumeGap(user.resumeText, application.skills, application.jobDescription);
    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze resume gap' });
  }
});

app.patch('/applications/:id/notes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { notes } = req.body;

    const application = await prisma.application.findFirst({ where: { id, userId: req.userId } });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { notes },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update notes' });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));