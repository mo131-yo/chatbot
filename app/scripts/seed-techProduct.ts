// import { Pinecone } from '@pinecone-database/pinecone';

// const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
// const index = pc.index('chatbot');

// const categories = ['Smartphones', 'Laptops', 'Wireless Headphones', 'Smartwatches', 'Tablets', 'Gaming Accessories'];
// const brands = ['Apple', 'Samsung', 'Sony', 'Dell', 'Asus', 'Logitech', 'Razer', 'Axus', 'Nokia'];
// const colors = ['Space Gray', 'Silver', 'Phantom Black', 'Midnight Blue', 'White', 'Red', 'Yellow', 'Pink'];

// const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// async function seedTechProducts() {
//   console.log("⚡ 500 электрон барааны өгөгдөл бэлдэж байна...");
  
//   const products = [];

//   for (let i = 1; i <= 500; i++) {  
//     const category = getRandom(categories);
//     const brand = getRandom(brands);
//     const name = `${brand} ${category} - Pro Series v${i}`;
    
//     const price = Math.floor(Math.random() * 10000000) + 50000; 
//     const description = `Шинэ үеийн ${brand} ${category}. Хамгийн сүүлийн үеийн технологи, өндөр хүчин чадал, цэвэрхэн загвар.`;

//     products.push({
//       id: `tech-prod-${i}`,
//       values: Array.from({ length: 1536 }, () => (Math.random() * 2 - 1)), 
//       metadata: {
//         name: name,
//         brand: brand,
//         category: category,
//         price: price,
//         color: getRandom(colors),
//         specifications: `${i % 2 === 0 ? '8GB RAM' : '16GB RAM'}, ${i % 3 === 0 ? '512GB SSD' : '256GB SSD'}`,
//         stock: Math.floor(Math.random() * 30),
//         description: description,
//         rating: (Math.random() * 1.5 + 3.5).toFixed(1),
//         warranty: "1 Year",
//         isRefurbished: i % 15 === 0 
//       },
//     });
//   }

//   const batchSize = 50;
//   for (let i = 0; i < products.length; i += batchSize) {
//     const batch = products.slice(i, i + batchSize);
//     await index.upsert({
//       records: batch
//     });
//     console.log(`🚀 ${i + batch.length} / 500 электрон бараа орлоо...`);
//   }

//   console.log("🎯 Технологийн 500 бараа амжилттай Pinecone руу хадгалагдлаа!");
// }

// seedTechProducts().catch(console.error);