import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index('chatbot');
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY! });

const brands = ['Nike', 'Adidas', 'Jordan', 'New Balance', 'Puma', 'Vans'];
const categories = ['Sneakers', 'Running', 'Basketball', 'Training', 'Casual'];
const colors = ['Black', 'White', 'Red', 'Blue', 'Grey'];
const genders = ['Men', 'Women', 'Unisex'];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

async function seedShoes() {
  console.log("👟 500 гутлын өгөгдлийг векторжуулж байна...");

  const totalShoes = 500;
  const batchSize = 50;

  for (let i = 1; i <= totalShoes; i += batchSize) {
    const currentBatchItems: any[] = [];
    const descriptions: string[] = [];

    for (let j = 0; j < batchSize && (i + j) <= totalShoes; j++) {
      const id = i + j;
      const brand = getRandom(brands);
      const category = getRandom(categories);
      const color = getRandom(colors);
      const gender = getRandom(genders);
      
      const shoeName = `${brand} ${category} ${color}`;
      const desc = `${brand}-ийн ${gender} ${category} төрлийн гутал. ${color} өнгөтэй, маш тухтай.`;

      // Илүү чанартай зураг (Unsplash Source ашиглан)
      // sig=${id} нь зураг бүрийг өвөрмөц байлгахыг баталгаажуулна
      const imageUrl = `https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop&sig=${id}`;
      // Эсвэл өөр өөр гутал харахыг хүсвэл:
      // const imageUrl = `https://loremflickr.com/600/600/sneakers,shoes?lock=${id}`;

      currentBatchItems.push({
        id: `shoe-${id}`,
        metadata: {
  name: shoeName,
  brand,
  category,
  color,
  gender,
  price: Math.floor(Math.random() * 500000) + 95000,
  // Тоог текст болгож хувиргаж байна: [39, 40] -> ["39", "40"]
  sizes: [38, 39, 40, 41, 42].filter(() => Math.random() > 0.3).map(String), 
  description: desc,
  image: imageUrl,
  stock: Math.floor(Math.random() * 15),
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
    console.log(`🚀 ${Math.min(i + batchSize - 1, totalShoes)} / ${totalShoes} гутал орлоо.`);
  }

  console.log("🎯 ТӨГСӨӨ!");
}

seedShoes().catch(console.error);