import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './prisma';
import { parseJobDescription } from './ai/parseJob';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create an application
app.post('/applications', async (req, res) => {
  try {
    const { company, role, jobDescription, notes, userId } = req.body;

    const application = await prisma.application.create({
      data: { company, role, jobDescription, notes, userId },
    });

    // Respond immediately, don't make the user wait for AI parsing
    res.status(201).json(application);

    // Parse in the background, then update the record
    if (jobDescription) {
      parseJobDescription(jobDescription)
        .then((parsed) =>
          prisma.application.update({
            where: { id: application.id },
            data: {
              skills: parsed.skills,
              seniority: parsed.seniority,
              salaryRange: parsed.salaryRange,
              remotePolicy: parsed.remotePolicy,
              parseStatus: 'done',
            },
          })
        )
        .catch((err) => {
          console.error('Parsing failed:', err);
          prisma.application.update({
            where: { id: application.id },
            data: { parseStatus: 'failed' },
          });
        });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// List all applications
app.get('/applications', async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));