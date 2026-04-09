import { index } from "@/lib/api/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const storeName = searchParams.get("storeName");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!storeName) {
      return NextResponse.json({ success: true, products: [] });
    }

    const queryResponse = await index.namespace(storeName).query({
      vector: new Array(1536).fill(0), 
      topK: 100,
      includeMetadata: true,
    });

    const products = queryResponse.matches?.map(match => ({
      id: match.id,
      ...match.metadata
    })) || [];

    return NextResponse.json({ 
      success: true, 
      products: products 
    });
  } catch (error: any) {
    console.error("Pinecone Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


