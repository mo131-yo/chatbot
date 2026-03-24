// import { Pinecone } from '@pinecone-database/pinecone';

// const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
// const index = pc.index('chatbot'); 

// const categories = ['Fitness', 'Basketball', 'Camping', 'Yoga', 'Cycling', 'Swimming', 'Hiking'];
// const brands = ['Nike', 'Adidas', 'North Face', 'Columbia', 'Lululemon', 'Under Armour', 'Decathlon'];
// const difficultyLevels = ['Beginner', 'Intermediate', 'Professional'];
// const seasons = ['Summer', 'Winter', 'All Season'];

// const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// async function seedSportProducts() {
//   console.log("🚴 1000 спорт болон аяллын барааны өгөгдөл бэлдэж байна...");
  
//   const products = [];

//   for (let i = 1; i <= 1000; i++) {
//     const category = getRandom(categories);
//     const brand = getRandom(brands);
//     const level = getRandom(difficultyLevels);
//     const season = getRandom(seasons);
//     const name = `${brand} ${category} - ${level} Gear v${i}`;
    
//     const price = Math.floor(Math.random() * 8000000) + 25000; 
//     const description = `${brand}-ийн ${category} зориулалттай, ${season} улиралд тохиромжтой ${level} түвшний хэрэглэл.`;

//     products.push({
//       id: `sport-prod-${i}`, 
//       values: Array.from({ length: 1536 }, () => (Math.random() * 2 - 1)), 
//       metadata: {
//         name: name,
//         brand: brand,
//         category: category,
//         price: price,
//         level: level,
//         season: season,
//         weight: `${(Math.random() * 10 + 0.5).toFixed(1)} kg`,
//         stock: Math.floor(Math.random() * 40),
//         description: description,
//         rating: (Math.random() * 1.2 + 3.8).toFixed(1),
//         isWaterproof: i % 3 === 0 
//       },
//     });
//   }

//   const batchSize = 50;
//   for (let i = 0; i < products.length; i += batchSize) {
//     const batch = products.slice(i, i + batchSize);
//     await index.upsert({
//       records: batch
//     });
//     console.log(`🚀 ${i + batch.length} / 1000 спорт бараа орлоо...`);
//   }

//   console.log("🎯 Спортын 1000 бараа амжилттай Pinecone руу хадгалагдлаа!");
// }

// seedSportProducts().catch(console.error);