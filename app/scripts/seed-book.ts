import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index('chatbot');
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY! });

const bookData = [
  { category: 'Зөгнөлт', names: ['Зөгнөлт', 'Ирээдүйн хот', 'Ангараг дээрх амьдрал', 'Хиймэл оюун ухаан 2050'], author: 'Б.Галсансүх' },
  { category: 'Уран зохиол', names: ['Туяа', 'Хөх судар', 'Цаг төрийн үймээн', 'Бид'], author: 'Л.Түдэв' },
  { category: 'Бизнес & Хувь хүний хөгжил', names: ['Баян аав Ядуу аав', 'Атомын зуршил', 'Эхлээд Яагаад гэдгээс эхэл'], author: 'James Clear' },
  { category: 'Түүх', names: ['Монголын нууц товчоо', 'Чингис хаан', 'Sapiens'], author: 'Yuval Noah Harari' },
  { category: 'Детектив & Нууцлаг', names: ['Шерлок Холмс', 'Аравхан жижигхэн индиан'], author: 'Agatha Christie' }
];

const categoryKeywords: Record<string, string> = {
  'Уран зохиол': 'novel,classic',
  'Бизнес & Хувь хүний хөгжил': 'business,success',
  'Шинжлэх ухаан': 'science,physics',
  'Түүх': 'history,world',
  'Детектив & Нууцлаг': 'mystery,crime',
  'Зөгнөлт': 'sci-fi,future'
};

async function seedBooks() {
  try {
    console.log("🧹 Хуучин өгөгдлийг цэвэрлэж байна...");
    await index.deleteAll();

    console.log("📚 Шинэ номын өгөгдлийг векторжуулж эхэллээ...");

    const totalBooks = 300;
    const batchSize = 50;

    for (let i = 1; i <= totalBooks; i += batchSize) {
      const currentBatchItems: any[] = [];
      const descriptions: string[] = [];

      for (let j = 0; j < batchSize && (i + j) <= totalBooks; j++) {
        const id = i + j;
        const categoryInfo = bookData[Math.floor(Math.random() * bookData.length)];
        const bookName = categoryInfo.names[Math.floor(Math.random() * categoryInfo.names.length)];
        const keyword = categoryKeywords[categoryInfo.category] || 'book';
        
        const desc = `${categoryInfo.category} төрлийн "${bookName}" ном. Зохиолч: ${categoryInfo.author}.`;

        const imageUrl = `https://loremflickr.com/500/700/book,${keyword.split(',')[0]}?lock=${id}`;

        currentBatchItems.push({
          id: `book-${id}`,
          metadata: {
            name: bookName,
            author: categoryInfo.author,
            category: categoryInfo.category,
            price: Math.floor(Math.random() * 50000) + 15000,
            description: desc,
            image: imageUrl,
            stock: Math.floor(Math.random() * 20),
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
      console.log(`🚀 ${Math.min(i + batchSize - 1, totalBooks)} ном орлоо.`);
    }

    console.log("🎯 Төгс боллоо! Одоо 'Зөгнөлт' гэж хайхад зөв ном гарна.");
  } catch (error) {
    console.error("Seed Error:", error);
  }
}

seedBooks();