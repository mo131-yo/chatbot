// app/admin/api/productAdd/route.ts
import { index } from "@/lib/api/pinecone";
import { auth } from "@clerk/nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, price, imageUrl, category, brand, stock, storeName } = body;

    // storeName байхгүй бол алдаа буцаана (400 error-оос сэргийлнэ)
    if (!storeName) {
      return NextResponse.json({ error: "Дэлгүүрийн нэр (storeName) байхгүй байна." }, { status: 400 });
    }

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_KEY,
      modelName: "text-embedding-3-small",
    });

    const vector = await embeddings.embedQuery(`Бүтээгдэхүүн: ${name}. Тайлбар: ${description}`);
    const generatedId = `prod_${Date.now()}`;

    // ✅ Анх үүсгэсэн storeName-ээр namespace болгон хадгалах
    await index.namespace(storeName).upsert({
      records: [  
        {
          id: generatedId,
          values: vector,
          metadata: {
            name,
            price: Number(price),
            product_image_url: imageUrl,
            description,
            category,
            brand,
            stock: Number(stock),
            store_name: storeName 
          },
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}