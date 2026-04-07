import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const openaiKey = process.env.OPENAI_KEY;
const pineconeApiKey = process.env.PINECONE_API_KEY;

if (!openaiKey || !pineconeApiKey) {
  throw new Error("API түлхүүрүүд .env файл дотор тохируулагдаагүй байна.");
}

const openai = new OpenAI({ apiKey: openaiKey });
const pc = new Pinecone({ apiKey: pineconeApiKey });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "Зураг олдсонгүй" }, { status: 400 });
    }

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

    const description = visionResponse.choices[0].message.content || "";

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: description,
    });

    const vector = embeddingResponse.data[0].embedding;

    const index = pc.index("chatbot");
    const queryResponse = await index.query({
      vector: vector,
      topK: 1,
      includeMetadata: true,
    });

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return NextResponse.json({ message: "Олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json(queryResponse.matches[0].metadata);
  } catch (error: any) {
    console.error("Visual Search Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
