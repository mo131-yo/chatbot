import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Pinecone } from "@pinecone-database/pinecone/dist/pinecone";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ error: "ID шаардлагатай" }, { status: 400 });
//     }

//     const product = await prisma.product.findUnique({
//       where: { 
//         id: id
//       },
//     });

//     if (!product) {
//       return NextResponse.json({ error: "Бараа олдсонгүй" }, { status: 404 });
//     }

//     return NextResponse.json(product);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Сүлжээний алдаа гарлаа" },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.index(process.env.PINECONE_NAME!);

    // Нийт барааг татах (кэшгүй)
    const queryResponse = await index.namespace(userId).query({
      vector: Array(1536).fill(0), // Dummy vector
      topK: 100,
      includeMetadata: true,
    });

    const products = queryResponse.matches.map(match => ({
      id: match.id,
      metadata: match.metadata
    }));

    return NextResponse.json(
      { success: true, products },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0', // Кэш ашиглахгүй
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
