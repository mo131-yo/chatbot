import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const queryResponse = await index.namespace(userId).query({
      vector: Array(1536).fill(0),
      topK: 100,
      includeMetadata: true,
    });

    const products = queryResponse.matches.map((match) => ({
      id: match.id,
      ...match.metadata,
      name: match.metadata?.name,
      price: match.metadata?.price,
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
