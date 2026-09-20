import { VoyageAIClient } from 'voyageai';

const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await voyage.embed({
    input: [text],
    model: 'voyage-3.5-lite', 
  });

  const embedding = response.data?.[0]?.embedding;
  if (!embedding) {
    throw new Error('Failed to generate embedding');
  }
  return embedding;
}
