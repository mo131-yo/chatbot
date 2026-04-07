import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";


const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);


// export async function POST(req: Request) {
//   try {

//     const body = await req.json();
//     const {
//       name,
//       description,
//       price,
//       images,
//       category,
//       brand,
//       color,
//       size,
//       stock,
//     } = body;

//     if (!name || !description) {
//       return Response.json(
//         { success: false, error: "Нэр болон тайлбар заавал байх ёстой." },
//         { status: 400 },
//       );
//     }

//     const productId = Date.now().toString();

//     const textToEmbed = `${name} ${description} ${brand} ${category} ${color} ${size} ${stock}`;
//     const embeddings = new OpenAIEmbeddings({
//       openAIApiKey: process.env.OPENAI_KEY,
//     });
//     const vector = await embeddings.embedQuery(textToEmbed);

//     await index.upsert({
//       records: [
//         {
//           id: productId,
//           values: vector,
//           metadata: {
//             name,
//             price,
//             description,
//             category,
//             brand,
//             color,
//             size,
//             stock,
//             image: Array.isArray(images) ? images.join(",") : images || "",
//           },
//         },
//       ],
//     });

//     return Response.json({
//       success: true,
//       message: "Амжилттай хадгалагдлаа",
//       id: productId,
//     });
//   } catch (error: any) {
//     console.error("Алдаа:", error);
//     return Response.json(
//       { success: false, error: error.message || "Алдаа гарлаа" },
//       { status: 500 },
//     );
//   }
// }

// ... (бусад import хэвээрээ)



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      price,
      images, // Энэ нь UploadThing-ээс ирсэн URL-уудын массив байна
      category,
      brand,
      color,
      size,
      stock,
    } = body;

    // 1. Шалгалт
    if (!name || !description) {
      return Response.json(
        { success: false, error: "Нэр болон тайлбар заавал байх ёстой." },
        { status: 400 },
      );
    }

    const productId = Date.now().toString();

    // 2. Текстээ вектор болгох (OpenAI ашиглан)
    const textToEmbed = `${name} ${description} ${brand} ${category} ${color} ${size}`;
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_KEY,
    });
    const vector = await embeddings.embedQuery(textToEmbed);

    await index.upsert({
      records: [
        {
          id: productId,
          values: vector,
          metadata: {
            name,
            price: Number(price),
            description,
            category,
            brand,
            color,
            size,
            stock: Number(stock),
            image: Array.isArray(images) ? images.join(",") : images || "",
          },
        },
      ],
    });

    return Response.json({
      success: true,
      message: "Бүтээгдэхүүн Pinecone-д амжилттай хадгалагдлаа",
      id: productId,
    });
  } catch (error: any) {
    console.error("Pinecone Upsert Error:", error);
    return Response.json(
      { success: false, error: error.message || "Алдаа гарлаа" },
      { status: 500 },
    );
  }
}
