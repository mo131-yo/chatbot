import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      id,  
      name,
      price,
      description,
      brand,
      category,
      stock,
      imageUrl,
      storeName, 
    } = body;

    if (!id) return NextResponse.json({ success: false, error: "ID шаардлагатай" }, { status: 400 });
    if (!storeName) return NextResponse.json({ success: false, error: "storeName шаардлагатай" }, { status: 400 });

    const numericPrice = parseFloat(price) || 0;
    const numericStock = parseInt(stock?.toString() || "0", 10);

    const updatedProduct = await prisma.product.update({
      where: { id: id },
      update: {
        name: name,
        price: numericPrice,
        description: description || "",
        brand: brand || "",
        stock: numericStock,
        images: imageUrl ? [imageUrl] : undefined,

        category: {
          connect: { id: categoryRecord.id },
        },
      },
      create: {
        id: id,
        name: name,
        price: numericPrice,
        description: description || "",
        brand: brand || "",
        stock: numericStock,
        images: imageUrl ? [imageUrl] : [],
        slug:
          name?.toLowerCase().trim().replace(/\s+/g, "-") ||
          `prod-${Date.now()}`,

        category: {
          connect: { id: categoryRecord.id },
        },
      },
    });

    await index.namespace(userId).update({
      id: id,
      metadata: {
        name: name,
        price: numericPrice,
        product_image_url: imageUrl || "",
        description: description || "",
        category: category || "General",
        brand: brand || "Unknown",
        stock: numericStock,
        store_name: storeName
      },
    },
  ],
});

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("UPDATE_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}