import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      brand,
      color,
      size,
      stock,
      storeName,
    } = body;

    const cleanNamespace = storeName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')   
      .replace(/[^a-z0-9-]/g, '')   
      || "general-store";


    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_KEY,
      modelName: "text-embedding-3-small",
    });

    const textToEmbed = `${name} ${description} ${brand} ${category} ${color} ${size}`;
    const vector = await embeddings.embedQuery(textToEmbed);

    const generatedId = `prod_${Date.now()}`;


await index.namespace(cleanNamespace).upsert({
  records: [
    {
      id: generatedId,
      values: vector,
      metadata: {
        name,
        price: Number(price) || 0,
        product_image_url: imageUrl || "",
        description,
        category: category || "General",
        brand: brand || "Unknown",
        stock: Number(stock) || 0,
        color: color || "",
        size: size || "",
        store_id: userId,
        store_name: storeName
      },
    },
  ],
});


    return NextResponse.json({ success: true, id: generatedId, namespace: cleanNamespace });
  } catch (error: any) {
    console.error("Pinecone API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}