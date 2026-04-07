import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const queryResponse = await index.namespace(userId).query({
      vector: Array(1536).fill(0), 
      topK: 100,
      includeMetadata: true,
    });

const products = queryResponse.matches.map((match) => {
  const meta = match.metadata as any;
  return {
    id: match.id,
    name: meta?.name || "Нэргүй",
    price: Number(meta?.price) || 0,
    images: meta?.product_image_url ? [meta.product_image_url] : [], 
    brand: meta?.brand || "-",
    stock: Number(meta?.stock) || 0,
  };
});

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}