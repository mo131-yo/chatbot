import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index('chatbot');

async function clearIndex() {
  try {
    console.log("🗑️ Pinecone-оос бүх өгөгдлийг устгаж байна...");

    await index.deleteAll();
    
    console.log("✨ Индекс бүрэн цэвэрлэгдлээ! Одоо шинээр 1000 бараагаа (OpenAI вектортой) оруулж болно.");
  } catch (error) {
    console.error("❌ Устгахад алдаа гарлаа:", error);
  }
}

clearIndex();




// import { Pinecone } from '@pinecone-database/pinecone';

// const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

// async function resetEverything() {
//   const indexName = 'chatbot';

//   try {
//     // 1. Одоо байгаа индексийг устгах
//     console.log(`🗑️ '${indexName}' индексийг бүрэн устгаж байна...`);
//     await pc.deleteIndex(indexName);
    
//     // Устгаж дуустал хэдэн секунд хүлээх хэрэгтэй байдаг
//     console.log("⏳ Түр хүлээнэ үү (Индексийг системээс арчиж байна)...");
//     await new Promise(resolve => setTimeout(resolve, 10000)); 

//     // 2. Шинээр индекс үүсгэх
//     console.log(`✨ '${indexName}' индексийг шинээр үүсгэж байна...`);
//     await pc.createIndex({
//       name: indexName,
//       dimension: 1536, // OpenAI-ийн text-embedding-3-small-д зориулж
//       metric: 'cosine', // Утгын хайлтад хамгийн тохиромжтой
//       spec: { 
//         serverless: { 
//           cloud: 'aws', 
//           region: 'us-east-1' 
//         }
//       }
//     });

//     console.log("✅ Амжилттай! Одоо чиний Storage яг 0GB болсон байгаа.");
//   } catch (error) {
//     console.error("❌ Алдаа гарлаа:", error);
//   }
// }

// resetEverything();