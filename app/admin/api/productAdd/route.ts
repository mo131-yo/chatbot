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
    const { name, description, price, imageUrl, category, brand, color, size, stock } = body;

    const textToEmbed = `${name} ${description} ${brand} ${category} ${color} ${size}`;
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_KEY,
      modelName: "text-embedding-3-small",
    });
    const vector = await embeddings.embedQuery(textToEmbed);

    const generatedId = `prod_${Date.now()}`;

   await index.namespace(userId).upsert({
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
            product_image_url: imageUrl || "",
            stock: Number(stock) || 0,
            color: color || "",
            size: size || "",
            store_id: userId
          },
        },
      ],
    });

    return NextResponse.json({ success: true, id: generatedId });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}