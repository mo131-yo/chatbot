import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
// Oruulaagui
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index('chatbot');
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY! });

const categories = ['Sofas', 'Dining Tables', 'Beds', 'Lighting', 'Office Chairs', 'Bookshelves', 'Carpets'];
const brands = ['IKEA', 'Ashley Furniture', 'Herman Miller', 'Wayfair', 'West Elm', 'Local Woodwork'];
const materials = ['Wood', 'Metal', 'Leather', 'Fabric', 'Glass', 'Velvet'];
const roomTypes = ['Living Room', 'Bedroom', 'Kitchen', 'Home Office', 'Dining Room'];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

async function seedHomeProduct() {
  const totalProducts = 1000;
  const batchSize = 100; 

  console.log("🛋️ Гэр ахуйн 1000 барааг векторжуулж эхэллээ...");

  for (let i = 0; i < totalProducts; i += batchSize) {
    const currentBatchDescriptions: string[] = [];
    const currentBatchRaw: any[] = [];

    for (let j = 0; j < batchSize && (i + j) < totalProducts; j++) {
      const id = i + j + 1;
      const category = getRandom(categories);
      const brand = getRandom(brands);
      const material = getRandom(materials);
      const room = getRandom(roomTypes);
      const desc = `${brand}-ийн ${material} материалаар хийгдсэн ${category}. ${room}-д зориулсан загвар.`;

      currentBatchDescriptions.push(desc);
      currentBatchRaw.push({
        id: `home-prod-${id}`,
        metadata: {
          name: `${brand} ${category} - ${material} Edition`,
          brand,
          category,
          price: Math.floor(Math.random() * 2000000) + 45000,
          material,
          roomType: room,
          description: desc,
          image: `https://luxe-home.mn/images/home-${id}.jpg`,
          stock: Math.floor(Math.random() * 15),
        }
      });
    }

    console.log(`⏳ Вектор үүсгэж байна: ${i + 1} - ${Math.min(i + batchSize, totalProducts)}...`);
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: currentBatchDescriptions,
    });

    const records: PineconeRecord[] = currentBatchRaw.map((item, idx) => ({
      id: item.id,
      values: embeddingResponse.data[idx].embedding, 
      metadata: item.metadata,
    }));

    await index.upsert({ records });
    console.log(`🚀 ${Math.min(i + batchSize, totalProducts)} бараа орлоо.`);
  }

  console.log("🎯 ТӨГСӨӨ! 1000 гэр ахуйн бараа амжилттай хадгалагдлаа.");
}

seedHomeProduct().catch(console.error);