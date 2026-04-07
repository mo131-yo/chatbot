// import { Pinecone } from "@pinecone-database/pinecone";
// import { OpenAIEmbeddings } from "@langchain/openai";


// const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
// const index = pc.index(process.env.PINECONE_NAME!);


// // export async function POST(req: Request) {
// //   try {

// //     const body = await req.json();
// //     const {
// //       name,
// //       description,
// //       price,
// //       images,
// //       category,
// //       brand,
// //       color,
// //       size,
// //       stock,
// //     } = body;

// //     if (!name || !description) {
// //       return Response.json(
// //         { success: false, error: "Нэр болон тайлбар заавал байх ёстой." },
// //         { status: 400 },
// //       );
// //     }

// //     const productId = Date.now().toString();

// //     const textToEmbed = `${name} ${description} ${brand} ${category} ${color} ${size} ${stock}`;
// //     const embeddings = new OpenAIEmbeddings({
// //       openAIApiKey: process.env.OPENAI_KEY,
// //     });
// //     const vector = await embeddings.embedQuery(textToEmbed);

// //     await index.upsert({
// //       records: [
// //         {
// //           id: productId,
// //           values: vector,
// //           metadata: {
// //             name,
// //             price,
// //             description,
// //             category,
// //             brand,
// //             color,
// //             size,
// //             stock,
// //             image: Array.isArray(images) ? images.join(",") : images || "",
// //           },
// //         },
// //       ],
// //     });

// //     return Response.json({
// //       success: true,
// //       message: "Амжилттай хадгалагдлаа",
// //       id: productId,
// //     });
// //   } catch (error: any) {
// //     console.error("Алдаа:", error);
// //     return Response.json(
// //       { success: false, error: error.message || "Алдаа гарлаа" },
// //       { status: 500 },
// //     );
// //   }
// // }

// // ... (бусад import хэвээрээ)



// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const {
//       name,
//       description,
//       price,
//       images, // Энэ нь UploadThing-ээс ирсэн URL-уудын массив байна
//       category,
//       brand,
//       color,
//       size,
//       stock,
//     } = body;

//     // 1. Шалгалт
//     if (!name || !description) {
//       return Response.json(
//         { success: false, error: "Нэр болон тайлбар заавал байх ёстой." },
//         { status: 400 },
//       );
//     }

//     const generatedId = Date.now().toString();

//     const textToEmbed = `${name} ${description} ${brand || ""} ${category || ""} ${color || ""} ${size || ""}`;

//     // 2. Текстээ вектор болгох (OpenAI ашиглан)
//     const textToEmbed = `${name} ${description} ${brand} ${category} ${color} ${size}`;
//     const embeddings = new OpenAIEmbeddings({
//       openAIApiKey: process.env.OPENAI_KEY,
//       modelName: "text-embedding-3-small", 
//     });
//     const vector = await embeddings.embedQuery(textToEmbed);

//     await index.upsert({
//       records: [
//         {
//           id: generatedId,
//           values: vector,
//           metadata: {
//             product_name: name,
//             formatted_price: Number(price),
//             description: description,
//             category: category || "General",
//             brand: brand || "Unknown",
//             product_image_url: Array.isArray(images) && images.length > 0 ? images[0] : "",
//             stock: Number(stock) || 0,
//             color: color || "",
//             size: size || ""
//           },
//         },
//       ],
//     });
//     console.log("\x1b[32m%s\x1b[0m", "✅ ШИНЭ БАРАА PINECONE-Д ОРЛОО!");
//     console.log(`ID: ${generatedId}`);
//     console.log(`Нэр: ${name}`);
//     console.log("-----------------------------------");
    
//     return Response.json({ 
//       success: true, 
//       message: "Амжилттай хадгалагдлаа",
//       pineconeId: generatedId 
//     });

//   } catch (error: any) {
//     console.error("Бүтээгдэхүүн нэмэхэд алдаа гарлаа:", error);
//     return Response.json(
//       { success: false, error: error.message || "Дотоод серверт алдаа гарлаа" }, 
//       { status: 500 }
//     );
//   }
// }






import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
 
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);
 
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      price,
      images,
      category,
      brand,
      color,
      size,
      stock,
    } = body;
 
    if (!name || !description) {
      return Response.json(
        { success: false, error: "Нэр болон тайлбар заавал байх ёстой." },
        { status: 400 },
      );
    }
 
    const generatedId = Date.now().toString();
 
    const textToEmbed = `${name} ${description} ${brand || ""} ${category || ""} ${color || ""} ${size || ""}`;
 
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_KEY,
      modelName: "text-embedding-3-small",
    });
 
    const vector = await embeddings.embedQuery(textToEmbed);
 
    await index.upsert({
      records: [
        {
          id: generatedId,
          values: vector,
          metadata: {
            product_name: name,
            formatted_price: Number(price),
            description: description,
            category: category || "General",
            brand: brand || "Unknown",
            product_image_url: Array.isArray(images) && images.length > 0 ? images[0] : "",
            stock: Number(stock) || 0,
            color: color || "",
            size: size || ""
          },
        },
      ],
    });
    console.log("\x1b[32m%s\x1b[0m", "✅ ШИНЭ БАРАА PINECONE-Д ОРЛОО!");
    console.log(`ID: ${generatedId}`);
    console.log(`Нэр: ${name}`);
    console.log("-----------------------------------");
    
    return Response.json({
      success: true,
      message: "Амжилттай хадгалагдлаа",
      pineconeId: generatedId
    });
 
  } catch (error: any) {
    console.error("Бүтээгдэхүүн нэмэхэд алдаа гарлаа:", error);
    return Response.json(
      { success: false, error: error.message || "Дотоод серверт алдаа гарлаа" },
      { status: 500 }
    );
  }
}