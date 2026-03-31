import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { index } from "@/lib/api/pinecone";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      storeName,
      description,
      price,
      images,
      stock,
      color,
      size,
      category,
      brand,
    } = body;

    const product = await prisma.product.create({
      data: {
        name,
        storeName,
        description,
        price,
        images,
        stock,
        color,
        size,
        category,
        brand,
        rating: 0,
        reviews: 0,
      },
    });

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: `${name} ${description} ${category} ${brand} ${color}`,
    });

    const vector = embedding.data[0].embedding;

    await index.upsert({
      records: [
        {
          id: product.id.toString(),
          values: vector,
          metadata: {
            name,
            price,
            category,
            brand,
            image: images?.[0] || "",
          },
        },
      ],
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Product үүсгэхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
