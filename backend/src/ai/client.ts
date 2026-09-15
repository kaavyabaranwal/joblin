import { groq } from '@ai-sdk/groq';

// One place to control which model powers which task.
export const models = {
  extraction: groq('openai/gpt-oss-120b'),
  // embedding model added here in Phase 3
};