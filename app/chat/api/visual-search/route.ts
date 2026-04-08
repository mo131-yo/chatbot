import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) return NextResponse.json({ error: "Зураг олдсонгүй" }, { status: 400 });

    // 1. Зургийг Vision-д зориулж Base64 болгох
    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    // 2. Vision ашиглан зургийг тайлбарлах
    const vision = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this product for search. Item type, color, brand, style." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
    });

    // ✅ Заавал string байхыг баталгаажуулав
    const description: string = vision.choices[0]?.message?.content || "No description provided";

    // 3. Тайлбараас Embedding үүсгэх
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: description,
    });

    // ❗ АЛДАА ГАРЧ БАЙСАН ХЭСЭГ: Энд дата байгаа эсэхийг заавал шалгах ёстой
    const vector = embeddingResponse.data[0]?.embedding;
    if (!vector) {
      throw new Error("Embedding үүсгэж чадсангүй.");
    }

    // 4. Pinecone-оос ижил төстэй барааг хайх
    const indexName = process.env.PINECONE_NAME;
    if (!indexName) throw new Error("Pinecone index name is missing");

    const index = pc.index(indexName);
    const queryResult = await index.query({
      vector: vector, // Одоо энд алдаа заахгүй
      topK: 6,
      includeMetadata: true,
    });

    // ✅ Metadata-г string формат руу хөрвүүлж баталгаажуулах
    const products = queryResult.matches.map(m => {
      const meta = (m.metadata || {}) as any;
      return {
        id: m.id,
        name: String(meta.product_name || meta.name || "Нэргүй"),
        price: String(meta.formatted_price || meta.price || "0"),
        image: String(meta.product_image_url || meta.image_url || meta.image || ""),
        description: String(meta.description || ""),
        store_id: String(meta.store_id || meta.storeId || "default")
      };
    });

    return NextResponse.json({ products, description });
  } catch (error: any) {
    console.error("Vision Search Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}