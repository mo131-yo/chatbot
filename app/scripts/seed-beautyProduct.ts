import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index('chatbot');
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY! });

const categories = ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Body Care', 'Sun Protection'];
const brands = ['L’Oréal', 'Estée Lauder', 'Shiseido', 'The Ordinary', 'Cerave', 'Innisfree', 'Dior'];
const skinTypes = ['Oily', 'Dry', 'Combination', 'Sensitive', 'All Skin Types'];
const features = ['Organic', 'Cruelty-Free', 'Paraben-Free', 'Vegan', 'Dermatologist Tested'];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

async function seedBeautyProducts() {
  console.log("💄 1000 гоо сайхны барааг OpenAI-аар векторжуулж байна...");

  const batchSize = 50;

  for (let i = 1; i <= 1000; i += batchSize) {
    const currentBatchItems: any[] = [];
    const descriptions: string[] = [];

    for (let j = 0; j < batchSize && (i + j) <= 1000; j++) {
      const id = i + j;
      const category = getRandom(categories);
      const brand = getRandom(brands);
      const skinType = getRandom(skinTypes);
      const feature = getRandom(features);
      const desc = `${brand}-ийн ${category}. ${skinType} арьсанд зориулсан ${feature} бүтээгдэхүүн.`;

      currentBatchItems.push({
        id: `beauty-prod-${id}`,
        metadata: {
          name: `${brand} ${category} - Glow Series v${id}`,
          brand,
          category,
          price: Math.floor(Math.random() * 800000) + 15000,
          skinType,
          description: desc,
          image: `https://luxe-store.mn/images/beauty-${id}.jpg`,
          stock: Math.floor(Math.random() * 100),
        }
      });
      descriptions.push(desc);
    }

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: descriptions,
    });

    const records: PineconeRecord[] = currentBatchItems.map((item, idx) => ({
      id: item.id,
      values: embeddingResponse.data[idx].embedding,
      metadata: item.metadata
    }));

    await index.upsert({ records });
    console.log(`🚀 ${Math.min(i + batchSize - 1, 1000)} / 1000 бараа орлоо...`);
  }

  console.log("🎯 ТӨГСӨӨ! Одоо чатбот чинь гоо сайхны барааг утгаар нь таньдаг боллоо.");
}

seedBeautyProducts().catch(console.error);