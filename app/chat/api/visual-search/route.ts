import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Environment variables-ийг дээр нь зарлаж өгөх
const openaiKey = process.env.OPENAI_KEY;
const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndexName = process.env.PINECONE_NAME;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "Зураг олдсонгүй" }, { status: 400 });
    }

    // Env шалгах
    if (!openaiKey || !pineconeApiKey || !pineconeIndexName) {
      return NextResponse.json({ error: "Серверийн тохиргооны алдаа (Env)" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiKey });
    const pc = new Pinecone({ apiKey: pineconeApiKey });

    // 1. Зургийг Base64 формат руу шилжүүлэх
    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    // 2. GPT-4o-mini ашиглан зургийг текст болгох (Vision)
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this product briefly for a search engine. Include brand, color, and item type in English.",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
    });

    const description = visionResponse.choices[0].message.content;
    if (!description) throw new Error("Vision description failed");

    // 3. Текстээс Embedding (Vector) үүсгэх
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: description,
    });
    const vector = embeddingResponse.data[0].embedding;

    // 4. Pinecone-оос хайх
    const index = pc.index(pineconeIndexName);
    const queryResponse = await index.query({
      vector,
      topK: 8,      
      includeMetadata: true,
    });

    const matches = queryResponse.matches || [];

    // 5. Score-оор шүүх (0.20-оос дээш тохиролтойг нь авах)
    const MIN_SCORE = 0.20;
    const goodMatches = matches
      .filter(m => (m.score || 0) >= MIN_SCORE)
      .map(m => ({
        id: m.id,
        score: m.score,
        ...(m.metadata as any) // Metadata-г задлаж өгөх
      }));

    if (goodMatches.length === 0) {
      return NextResponse.json({ error: "Тохирох бараа олдсонгүй." }, { status: 404 });
    }

    // Олдсон бүх сайн тохирсон бараануудыг буцаана
    return NextResponse.json({ 
      success: true, 
      products: goodMatches,
      description: description // AI юу гэж ойлгосныг харах зорилгоор
    });

  } catch (error: any) {
    console.error("🚨 Visual Search Error:", error);
    return NextResponse.json(
      { error: "Visual search failed", details: error.message },
      { status: 500 }
    );
  }
}