import { generateObject } from 'ai';
import { z } from 'zod';
import { models } from './client';

const jobInfoSchema = z.object({
  skills: z.array(z.string()).describe('Key technical skills or requirements mentioned'),
  seniority: z.enum(['Junior', 'Mid', 'Senior', 'Lead']).nullable(),
  salaryRange: z.string().nullable().describe('Salary range if mentioned, otherwise null'),
  remotePolicy: z.enum(['Remote', 'Hybrid', 'Onsite']).nullable(),
});

export type ParsedJobInfo = z.infer<typeof jobInfoSchema>;

export async function parseJobDescription(jobDescription: string): Promise<ParsedJobInfo> {
  const { object } = await generateObject({
    model: models.extraction,
    schema: jobInfoSchema,
    prompt: `Extract structured information from this job description:\n\n${jobDescription}`,
  });

  return object;
}