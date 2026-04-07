import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!openaiKey || !pineconeApiKey || !pineconeIndexName) {
      const missing = [
        !openaiKey && "OPENAI_KEY",
        !pineconeApiKey && "PINECONE_API_KEY",
        !pineconeIndexName && "PINECONE_NAME",
      ].filter(Boolean).join(", ");
      return NextResponse.json({ error: `Env алдаа: ${missing}` }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiKey });
    const pc = new Pinecone({ apiKey: pineconeApiKey });

    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) return NextResponse.json({ error: "Зураг илгээгдээгүй." }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

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
    if (!description) throw new Error("Vision failed");
    console.log("📝 Description:", description);

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: description,
    });
    const vector = embeddingResponse.data[0].embedding;

    const index = pc.index("chatbot");
    const queryResponse = await index.query({
      vector,
      topK: 8,      
      includeMetadata: true,
    });

    const matches = queryResponse.matches || [];

    if (matches.length === 0) {
      return NextResponse.json({ error: "Тохирох бараа олдсонгүй." }, { status: 404 });
    }

    const MIN_SCORE = 0.20;
    const goodMatches = matches.filter(m => (m.score || 0) >= MIN_SCORE);

    if (goodMatches.length === 0) {
      return NextResponse.json({ error: "Тохирох бараа олдсонгүй." }, { status: 404 });
    }

    return NextResponse.json(queryResponse.matches[0].metadata);
  } catch (error: any) {
    console.error("🚨 Visual Search Error:", error);
    return NextResponse.json(
      { error: "Visual search failed", details: error.message },
      { status: 500 }
    );
  }
}
