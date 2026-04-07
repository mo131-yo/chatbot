// import { NextResponse } from "next/server";
// import { Pinecone } from "@pinecone-database/pinecone";
// import { auth } from "@clerk/nextjs/server";

// const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
// const index = pc.index(process.env.PINECONE_NAME!);

// export async function GET() {
//   try {
//     const { userId } = await auth();
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const queryResponse = await index.namespace(userId).query({
//       vector: Array(1536).fill(0),
//       topK: 100,
//       includeMetadata: true,
//     });

// const products = queryResponse.matches.map((match) => {
//   const meta = match.metadata;

//   return {
//     id: match.id,
//     ...meta,
//     name: meta?.name || "Нэргүй бараа",
//     price: meta?.price ? Number(meta.price) : 0,
//     images: meta?.product_image_url ? [meta.product_image_url] : [],
//     brand: meta?.brand || "-",
//     stock: meta?.stock ? Number(meta.stock) : 0,
//   };
// });

//     return NextResponse.json({ success: true, products });
//   } catch (error: any) {
//     console.error("PINECONE_GET_ERROR:", error);
//     return NextResponse.json({ success: false, error: error.message });
//   }
// }

// app/admin/api/productAllGet/route.ts хэсэгт:

import { Pinecone } from "@pinecone-database/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Хамгийн чухал хэсэг: includeMetadata: true
    const queryResponse = await index.namespace(userId).query({
      vector: Array(1536).fill(0), // Бүх барааг авахын тулд хоосон вектор ашиглаж болно
      topK: 100,
      includeMetadata: true, // ЭНЭ МӨР ЗААВАЛ БАЙХ ЁСТОЙ
    });

    // Датаг фронтод ойлгомжтой болгож цэгцлэх
    const products = queryResponse.matches.map((match) => ({
      id: match.id,
      ...match.metadata, // Metadata-г гадагшлуулж байна
      // Хэрэв фронт 'name' гэж хүлээж авч байгаа бол:
      name: match.metadata?.product_name,
      price: match.metadata?.formatted_price,
      brand: match.metadata?.brand,
      stock: match.metadata?.stock,
      images: match.metadata?.product_image_url
        ? [match.metadata.product_image_url]
        : [],
    }));

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("Fetch API Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
