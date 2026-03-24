// import { Pinecone } from '@pinecone-database/pinecone';

// const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
// const index = pc.index('chatbot'); 

// const categories = ['Shoes', 'Hats', 'Hoodies', 'T-shirts', 'Accessories'];
// const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Grey'];
// const brands = ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance'];

// const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// async function seedProducts() {
//   console.log("500 барааны өгөгдөл бэлдэж байна...");
  
//   const products = [];

//   for (let i = 1; i <= 500; i++) {
//     const category = getRandom(categories);
//     const brand = getRandom(brands);
//     const name = `${brand} ${category} - Model ${i}`;
//     const price = Math.floor(Math.random() * 450000) + 15000; 
//     const description = `Энэхүү ${brand} брэндийн ${category} нь өдөр тутмын хэрэглээнд тохиромжтой, чанартай материалтай.`;

//     products.push({
//       id: `prod-${i}`,
//       values: Array.from({ length: 1536 }, () => (Math.random() * 2 - 1)), 
//       metadata: {
//         name: name,
//         brand: brand,
//         category: category,
//         price: price,
//         color: getRandom(colors),
//         size: getRandom(['S', 'M', 'L', 'XL', '42', '43', '44']),
//         stock: Math.floor(Math.random() * 50),
//         description: description,
//         rating: (Math.random() * 5).toFixed(1), 
//         isNew: i % 10 === 0 
//       },
//     });
//   }

//   const batchSize = 50;
//   for (let i = 0; i < products.length; i += batchSize) {
//     const batch = products.slice(i, i + batchSize);
//     await index.upsert({
//     records: batch
//     });
//     console.log(`🚀 ${i + batch.length} / 500 бараа орлоо...`);
//   }

//   console.log("🎯 Бүх бараа амжилттай Pinecone руу хадгалагдлаа!");
// }

// seedProducts().catch(console.error);