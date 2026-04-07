import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const openaiKey = process.env.OPENAI_KEY;
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const pineconeIndexName = process.env.PINECONE_NAME;

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
    const base64Image = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    console.log("🚀 Vision analysis...");

    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this product for a search engine. Include: product type, brand (if visible), color, material, style. Be specific and concise in English.",
          },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
        ],
      }],
      max_tokens: 200,
    });

    const description = visionResponse.choices[0].message.content;
    if (!description) throw new Error("Vision failed");
    console.log("📝 Description:", description);

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: description,
    });
    const vector = embeddingResponse.data[0].embedding;

    const index = pc.index(pineconeIndexName);
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

    console.log(`✅ ${goodMatches.length} matches found`);

    const products = goodMatches.map(m => ({
      id: m.id,
      product_name: m.metadata?.product_name || m.metadata?.name || "Нэргүй",
      name: m.metadata?.product_name || m.metadata?.name || "Нэргүй",
      formatted_price: m.metadata?.formatted_price || m.metadata?.price || "0",
      price: m.metadata?.formatted_price || m.metadata?.price || "0",
      description: m.metadata?.description || "",
      image: m.metadata?.product_image_url || m.metadata?.image_url || "",
      product_image_url: m.metadata?.product_image_url || m.metadata?.image_url || "",
      brand: m.metadata?.brand || "",
      category: m.metadata?.category || "",
      store_id: m.metadata?.store_id || "store-default",
      score: m.score,
    }));

    return NextResponse.json({ products, bestMatch: products[0] });

  } catch (error: any) {
    console.error("🚨 Visual Search Error:", error);
    return NextResponse.json(
      { error: "Visual search failed", details: error.message },
      { status: 500 }
    );
  }
}