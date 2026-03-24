// import { Pinecone } from '@pinecone-database/pinecone';

// const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
// const index = pc.index('chatbot'); 

// const categories = ['Educational Toys', 'Action Figures', 'Board Games', 'Plush Toys', 'Baby Gear', 'Outdoor Play'];
// const brands = ['LEGO', 'Hasbro', 'Mattel', 'Fisher-Price', 'Disney', 'Nintendo'];
// const ageGroups = ['0-3 years', '3-6 years', '6-12 years', '12+ years'];
// const materials = ['Plastic', 'Wood', 'Fabric', 'Eco-friendly Resin'];

// const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// async function seedToyProducts() {
//   console.log("🧸 1000 тоглоом болон хүүхдийн барааны өгөгдөл бэлдэж байна...");
  
//   const products = [];

//   for (let i = 1; i <= 1000; i++) {
//     const category = getRandom(categories);
//     const brand = getRandom(brands);
//     const age = getRandom(ageGroups);
//     const name = `${brand} ${category} - Fun Edition v${i}`;
    
//     const price = Math.floor(Math.random() * 1500000) + 10000; 
//     const description = `${brand}-ийн ${category}. ${age} насны хүүхдүүдэд зориулсан, ${getRandom(materials)} материалаар хийгдсэн аюулгүй тоглоом.`;

//     products.push({
//       id: `toy-prod-${i}`, 
//       values: Array.from({ length: 1536 }, () => (Math.random() * 2 - 1)), 
//       metadata: {
//         name: name,
//         brand: brand,
//         category: category,
//         price: price,
//         ageGroup: age,
//         material: getRandom(materials),
//         safetyStandard: "ISO 9001 Certified",
//         stock: Math.floor(Math.random() * 100),
//         description: description,
//         rating: (Math.random() * 1.0 + 4.0).toFixed(1),
//         isEducational: i % 3 === 0 
//       },
//     });
//   }

//   const batchSize = 100;
//   for (let i = 0; i < products.length; i += batchSize) {
//     const batch = products.slice(i, i + batchSize);
//     await index.upsert({
//       records: batch
//     });
//     console.log(`🚀 ${i + batch.length} / 1000 тоглоом орлоо...`);
//   }

//   console.log("🎯 Хүүхдийн 1000 бараа амжилттай Pinecone руу хадгалагдлаа!");
// }

// seedToyProducts().catch(console.error);