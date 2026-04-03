import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { index } from "@/lib/api/pinecone";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function GET() {
  try {
    const products = await prisma.product.findMany({ 
      include: { store: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Бараа авахад алдаа гарлаа" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.name.toLowerCase().trim().replace(/\s+/g, "-"), 
        description: body.description || "",
        price: Number(body.price),
        brand: body.brand || "",
        category: body.category || "",
        storeId: body.storeId,
        stock: Number(body.stock) || 0,
        images: body.images || [],
      },
    });

    if (process.env.OPENAI_KEY) {
      const textToEmbed = `${product.name} ${product.brand} ${product.category} ${product.description}`;

      try {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: textToEmbed,
        });

        const vector = embeddingResponse.data[0].embedding;

        await index.upsert({
          records: [
            {
              id: product.id,
              values: vector,
              metadata: {
                name: product.name,
                price: product.price,
                category: product.category || "",
                brand: product.brand || "",
              },
            },
          ],
        });
        
        console.log("Pinecone-д амжилттай хадгалагдлаа!");
      } catch (pineconeError) {
        console.error("Pinecone/OpenAI Error:", pineconeError);
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Бараа үүсгэхэд алдаа гарлаа" }, { status: 500 });
  }
}