import OpenAI from "openai";
import { index } from "./pinecone";


export const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function getEmbedding(text: string) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

export async function saveProduct(product: any, storeName: string) {
  const embedding = await getEmbedding(
    `${product.name} ${product.category} ${product.description}`
  );

  await index.namespace(storeName).upsert({
    records: [
      {
        id: product.id || crypto.randomUUID(),
        values: embedding,
        metadata: {
          name: product.name,
          price: String(product.price),
          category: product.category,
          description: product.description,
          image_url: product.image_url || "",
          store_name: storeName,
        },
      },
    ],
  });
}