// @ts-nocheck
import { PrismaClient } from "../../../generated/prisma";
import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { resolve } from "path";

// .env.local-ийн яг замыг тодорхойлно
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

async function migrate() {
  console.log("🔌 Database холбогдож байна...");
  console.log("PINECONE_API_KEY:", process.env.PINECONE_API_KEY ? "✅ байна" : "❌ байхгүй");
  console.log("PINECONE_NAME:", process.env.PINECONE_NAME ?? "❌ байхгүй");

  const stores = await prisma.store.findMany();
  console.log(`📦 ${stores.length} дэлгүүр олдлоо:`, stores.map(s => `${s.name} (${s.id})`));

  if (stores.length === 0) {
    console.log("⚠️  Дэлгүүр олдсонгүй.");
    return;
  }

  for (const store of stores) {
    console.log(`\n🔍 "${store.name}" дэлгүүрийн бараануудыг шинэчилж байна...`);

    try {
      const res = await index.namespace(store.name).query({
        vector: new Array(1536).fill(0.000001),
        topK: 100,
        includeMetadata: true,
      });

      if (!res.matches || res.matches.length === 0) {
        console.log(`   ℹ️  Барaa олдсонгүй.`);
        continue;
      }

      console.log(`   📋 Нийт ${res.matches.length} барaa олдлоо`);

      const needsUpdate = res.matches.filter((m) => !m.metadata?.storeId);

      if (needsUpdate.length === 0) {
        console.log(`   ✅ Бүх барaa аль хэдийн storeId-тай байна.`);
        continue;
      }

      console.log(`   📝 ${needsUpdate.length} барааг шинэчилж байна...`);

      const BATCH = 50;
      for (let i = 0; i < needsUpdate.length; i += BATCH) {
        const batch = needsUpdate.slice(i, i + BATCH);
        await index.namespace(store.name).upsert({
          records: batch.map((match) => ({
            id: match.id,
            values: new Array(1536).fill(0.000001),
            metadata: {
              ...(match.metadata as Record<string, any>),
              storeId: store.id,
              store_name: store.name,
              storeName: store.name,
            },
          })),
        });
        console.log(`   ✅ Batch ${i / BATCH + 1} дууслаа`);
      }

      console.log(`   🎉 "${store.name}": ${needsUpdate.length} барaa шинэчлэгдлээ.`);
    } catch (err) {
      console.error(`   ❌ "${store.name}" алдаа:`, err);
    }
  }

  console.log("\n🎉 Migration бүрэн дууслаа!");
  await prisma.$disconnect();
}

migrate().catch(async (e) => {
  console.error("💥 Migration алдаа:", e);
  await prisma.$disconnect();
  process.exit(1);
});
