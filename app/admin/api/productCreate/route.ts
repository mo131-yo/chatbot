import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { v2 as cloudinary } from "cloudinary";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      images,
      category,
      brand,
      color,
      size,
      stock,
    } = body;

  
    let finalImages = images;

    if (Array.isArray(images) && images[0]?.startsWith("data:image")) {
      const uploadPromises = images.map(async (imgBase64) => {
        const res = await cloudinary.uploader.upload(imgBase64, {
          folder: "products",
        });
        return res.secure_url;
      });
      finalImages = await Promise.all(uploadPromises);
    }

    if (!name || !description) {
      return Response.json(
        { success: false, error: "Нэр болон тайлбар заавал байх ёстой." },
        { status: 400 },
      );
    }

    const productId = Date.now().toString();

   
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
            
            image: Array.isArray(finalImages)
              ? finalImages.join(",")
              : finalImages || "",
          },
        },
      ],
    });

    return Response.json({
      success: true,
      message: "Амжилттай хадгалагдлаа",
      id: productId,
    });
  } catch (error: any) {
    console.error("Алдаа:", error);
    return Response.json(
      { success: false, error: error.message || "Алдаа гарлаа" },
      { status: 500 },
    );
  }
}
