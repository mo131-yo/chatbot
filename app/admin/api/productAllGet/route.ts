// import { index } from "@/lib/api/pinecone";
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   try {
//     const { userId } = await auth();
//     const { searchParams } = new URL(req.url);
//     const storeName = searchParams.get("storeName");

//     if (!userId) {
//       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
//     }

//     if (!storeName) {
//       return NextResponse.json({ success: true, products: [] });
//     }

//     const queryResponse = await index.namespace(storeName).query({
//       vector: new Array(1536).fill(0), 
//       topK: 100,
//       includeMetadata: true,
//     });

//     const products = queryResponse.matches?.map(match => ({
//       id: match.id,
//       ...match.metadata
//     })) || [];

//     return NextResponse.json({ 
//       success: true, 
//       products: products 
//     });
//   } catch (error: any) {
//     console.error("Pinecone Error:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }


import { index } from "@/lib/api/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const storeName = searchParams.get("storeName");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Хэрэв дэлгүүрийн нэр ирээгүй бол хоосон массив буцаана
    if (!storeName) {
      return NextResponse.json({ success: true, products: [] });
    }

    // Pinecone-оос тухайн namespace-ийн бүх барааг татах
    // Тайлбар: Vector нь 0-ээр дүүрсэн байх нь Semantic хайлт биш, 
    // зөвхөн байгаа бараануудыг "жагсааж" авч ирэх зориулалттай.
    const queryResponse = await index.namespace(storeName).query({
      vector: new Array(1536).fill(0),
      topK: 1000, // Админ панел тул арай олныг (жишээ нь 1000) татах нь зүгээр
      includeMetadata: true,
    });

    // Metadata-г хэрэглэгчид ойлгомжтой формат руу хөрвүүлэх
    const products =
      queryResponse.matches?.map((match) => {
        const metadata = match.metadata as any;
        return {
          id: match.id,
          name: metadata.name || "Нэргүй бараа",
          price: metadata.price || 0,
          description: metadata.description || "",
          // Таны Pinecone-д хадгалсан зургийн талбарын нэрийг шалгаарай
          image: metadata.product_image_url || metadata.image || "", 
          category: metadata.category || "Ангилалгүй",
          stock: metadata.stock || 0,
          ...metadata, // Бусад бүх metadata-г давхар авна
        };
      }) || [];

    return NextResponse.json({
      success: true,
      products: products,
    });
  } catch (error: any) {
    console.error("Pinecone Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
