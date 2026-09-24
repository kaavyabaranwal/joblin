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

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await voyage.embed({
    input: texts,
    model: 'voyage-3.5-lite',
  });

  const embeddings = response.data?.map((d) => d.embedding);
  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error('Failed to generate embeddings batch');
  }
  return embeddings as number[][];
}