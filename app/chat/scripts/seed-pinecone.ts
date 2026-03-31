import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("Index Name:", process.env.PINECONE_NAME);
console.log("OpenAI Key Status:", process.env.OPENAI_KEY ? "Found" : "Not Found");

const pc = new Pinecone({ 
  apiKey: process.env.PINECONE_API_KEY! 
});

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_KEY! 
});
const products = [
  {
    id: "beauty-1",
    name: "L'Oreal Shampoo",
    storeId: "store-gobi-001",
    storeName: "Gobi Beauty",
    price: 25000,
    category: "Hair Care",
    image: "https://example.com/shampoo.jpg",
    text: "L'Oreal professional shampoo for deep hydration and shine."
  },
  {
    id: "beauty-2",
    name: "Face Cream",
    storeId: "store-shangrila-005",
    storeName: "Shangri-La Cosmetics",
    price: 45000,
    category: "Skin Care",
    image: "https://example.com/cream.jpg",
    text: "Hydrating face cream with Vitamin C for all skin types."
  }
];

async function seedAll() {
  const indexName = process.env.PINECONE_NAME;
  
  if (!indexName) {
    console.error("❌ Алдаа: PINECONE_NAME олдсонгүй.");
    return;
  }

  const index = pc.index(indexName);
  console.log("🚀 Pinecone руу өгөгдөл оруулж эхэллээ...");

  for (const item of products) {
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: `${item.name} ${item.category} ${item.text}`,
      });

      const vector = embeddingResponse.data[0].embedding;

      await index.upsert({
        records:[{
        id: item.id,
        values: vector,
        metadata: {
          name: item.name,
          price: item.price,
          storeId: item.storeId,
          storeName: item.storeName,
          category: item.category,
          image: item.image,
          description: item.text
        }
        }]
      });

      console.log(`✅ Амжилттай: ${item.name}`);
    } catch (error) {
      console.error(`❌ Алдаа гарлаа (${item.name}):`, error);
    }
  }

  console.log("🏁 Бүх өгөгдөл орж дууслаа.");
}

seedAll();