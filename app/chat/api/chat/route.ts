import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { index } from "@/lib/api/pinecone";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY, timeout: 30000 });

type IncomingMessage = {
  role: "USER" | "ASSISTANT" | "SYSTEM" | "user" | "assistant" | "system";
  content: string;
};

function normalizeRole(role: IncomingMessage["role"]): "user" | "assistant" | "system" {
  const r = role.toLowerCase();
  if (r === "user" || r === "assistant" || r === "system") return r as any;
  return "user";
}

function extractMaxPrice(text: string): number | null {
  const priceRegex = /(\d+(?:[.,]\d+)?)\s*(k|к|мянган|мян|төгрөг|төг|t|₮|tg|сая|say)/gi;
  const matches = [...text.matchAll(priceRegex)];
  if (!matches.length) return null;
  const last = matches[matches.length - 1];
  let value = parseFloat(last[1].replace(",", ""));
  const unit = (last[2] || "").toLowerCase();
  if (["k", "к", "мянган", "мян"].includes(unit)) value *= 1000;
  else if (["сая", "say"].includes(unit)) value *= 1_000_000;
  else if (value < 1000) value *= 1000;
  return Number.isFinite(value) ? value : null;
}

const ALL_NAMESPACES = [
  "", "most_used_beauty_cosmetics-namespace", "beauty-namespace",
  "fashion-namespace", "shoes-namespace", "electronics-namespace", "books-namespace",
];

const NS_KEYWORDS: Record<string, string[]> = {
  "most_used_beauty_cosmetics-namespace": [
    "гоо сайхан", "косметик", "beauty", "cosmetic", "крем", "cream", "тоник",
    "нүүр", "арьс", "лосьон", "маск", "mask", "lipstick", "уруул", "нүдний",
    "eyeshadow", "foundation", "тушь", "серум", "serum", "мэйкап", "makeup",
  ],
  "beauty-namespace": ["шампунь", "үс", "hair", "conditioner", "шүршүүр"],
  "fashion-namespace": [
    "хувцас", "fashion", "цамц", "өмд", "dress", "jacket", "coat", "хүрэм",
    "малгай", "hat", "дэгээ", "бүс", "belt", "bag", "цүнх", "hoodie",
    "sweater", "pullover", "shirt", "blouse",
  ],
  "shoes-namespace": ["гутал", "shoe", "sneaker", "boot", "сандал", "sandal", "heel", "өсгий"],
  "electronics-namespace": [
    "утас", "phone", "laptop", "компьютер", "tablet", "дэлгэц", "monitor",
    "earphone", "чихэвч", "speaker", "колонк", "camera", "зурагт", "tv",
    "цэнэглэгч", "charger", "keyboard", "mouse", "хулгана", "watch", "цаг",
    "iphone", "samsung", "xiaomi", "apple", "airpods", "электрон",
  ],
  "books-namespace": [
    "ном", "book", "тууж", "роман", "novel", "уншиx", "зохиол", "шүлэг",
    "poetry", "хүүхэд", "children", "сурах", "textbook",
  ],
};

function detectNamespaces(query: string): string[] {
  const lower = query.toLowerCase();
  const matched = Object.entries(NS_KEYWORDS)
    .filter(([, kws]) => kws.some(kw => lower.includes(kw)))
    .map(([ns]) => ns);
  return matched.length > 0 ? matched : ALL_NAMESPACES;
}

function metadataToContext(m: any): string {
  const meta = m.metadata || {};
  return [
    `ID: ${m.id}`,
    `Нэр: ${meta.product_name || meta.name || "Нэргүй"}`,
    `Үнэ: ${meta.formatted_price || meta.price || "?"}₮`,
    meta.brand       && `Брэнд: ${meta.brand}`,
    meta.category    && `Категори: ${meta.category}`,
    meta.color       && `Өнгө: ${meta.color}`,
    meta.size        && `Хэмжээ: ${meta.size}`,
    meta.rating      && `Үнэлгээ: ${meta.rating}`,
    meta.discount    && `Хөнгөлөлт: ${meta.discount}`,
    meta.store_id    && `Дэлгүүр: ${meta.store_id}`,
    (meta.product_image_url || meta.image_url) && `Зураг: ${meta.product_image_url || meta.image_url}`,
    meta.description && `Тайлбар: ${meta.description}`,
  ].filter(Boolean).join("\n");
}

const buildSystemPrompt = (context: string) => `
Чи бол найрсаг онлайн дэлгүүрийн борлуулалтын зөвлөх. Хэрэглэгчтэй найз шиг харьц.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 БАРАА ХАРУУЛАХ ФОРМАТ (ЗААВАЛ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Бараа санал болгохдоо ЗААВАЛ: ![Нэр, Үнэ_тоогоор, Тайлбар, ProductID, StoreID](SEARCH_IMAGE_PLACEHOLDER)

 Зөв: ![Nike Air Max 90, 125000, Гүйлтэд зориулсан гутал, abc123, store001](SEARCH_IMAGE_PLACEHOLDER)
 URL өөрөө зохиохгүй. ID орхихгүй. SEARCH_IMAGE_PLACEHOLDER хэвээр үлдээ.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍INTENT ШИНЖЛЭХ (ХАМГИЙН ЧУХАЛ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Хэрэглэгч хайлт хийх бүрт ЗӨВХӨН сүүлийн хүсэлтэд тохирох барааг харуул:
- "ном" хайсны дараа "чихэвч бну?" → чихэвч харуул, номын тухай ярихгүй
- "hoodie байна уу?" → hoodie харуул
- "өмнөхийг", "тэр барааг" → өмнөх барааруу буц

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 НЭМЭЛТ МЭДЭЭЛЭЛ ЦУГЛУУЛАХ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Хэрэглэгч хувцас/гутал хайж байгаа бол:
- Өнгө заагаагүй → "Ямар өнгөтэй байвал таалагдах вэ?" — нэг л удаа асуу
- Хэмжээ заагаагүй → "Ямар хэмжээний бэ?" — нэг л удаа асуу
- Хоёуланг зэрэг асуухгүй, нэг асуулт нэг удаа

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ҮНЭ ХЯЗГААР
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Үнийн хязгаар байвал context-оос тохирохыг л харуул
- Олдохгүй бол: "Харамсалтай, [үнэ]₮-д тохирох бараа олдсонгүй. [Хямд нь XX₮-с эхэлнэ], үзэх үү?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ХАРИЛЦААНЫ ХЭЛБЭР
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- "За, одоохон!", "Ёстой гоё!", "Мэдээж хэрэг" гэх мэт найрсаг үг хэрэглэ
- Metadata ухаалгаар ашигла: үнэлгээ өндөр → дурдах, хөнгөлөлт байвал → заавал дурдах
- Роботоор ярихгүй

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ХУДАЛДАН АВАЛТ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"авна", "захиална", "buy" гэвэл:
1. "Та [Нэр]-г [Үнэ]₮-ээр авахад бэлэн үү?" гэж асуу
2. "Тийм" → ЗӨВХӨН: PAYMENT_TRIGGER:{"id":"id","name":"нэр","price":үнэ}
3. "Үгүй" → "За! Өөр бараа үзмээр байна уу?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 БАРААНУУДЫН МЭДЭЭЛЭЛ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${context || "Тохирох бараа олдсонгүй. Ерөнхий зөвлөгөө өг."}`;

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    const body = await req.json();
    const messages = body?.messages as IncomingMessage[] | undefined;
    const chatId = body?.chatId as string | undefined;
    const fallbackUserId = body?.userId as string | undefined;

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content?.trim();
    if (!lastUserMessage) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const maxPrice = extractMaxPrice(lastUserMessage);
    const targetNamespaces = detectNamespaces(lastUserMessage);
    console.log(`🔍 "${lastUserMessage}" → [${targetNamespaces.join(", ")}] | max: ${maxPrice ?? "∞"}`);

    let context = "";
    try {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: lastUserMessage,
      });

      const results = await Promise.all(
        targetNamespaces.map(ns =>
          index.namespace(ns).query({
            vector: embedding.data[0].embedding,
            topK: 8,
            includeMetadata: true,
            ...(maxPrice ? { filter: { formatted_price: { $lte: maxPrice } } } : {}),
          }).catch(err => { console.warn(`NS "${ns}" failed:`, err.message); return { matches: [] }; })
        )
      );

      const seen = new Set<string>();
      const topMatches = results
        .flatMap(r => r.matches || [])
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; })
        .slice(0, 10);

      context = topMatches.map(metadataToContext).join("\n---\n");
      console.log(`✅ ${topMatches.length} matches`);
    } catch (err) {
      console.error("Vector Search Error:", err);
    }


    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0.4,
      messages: [
        { role: "system", content: buildSystemPrompt(context) },
        ...messages.map(m => ({ role: normalizeRole(m.role), content: m.content })),
      ],
    });

    let fullReply = "";

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullReply += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } finally {
          controller.close();
          const effectiveUserId = clerkUserId || fallbackUserId;
          if (effectiveUserId && chatId && !chatId.startsWith("guest_")) {
            saveToDb(effectiveUserId, chatId, lastUserMessage, fullReply).catch(console.error);
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("API_GLOBAL_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
  }
}

async function saveToDb(clerkUserId: string, chatId: string, userMsg: string, aiReply: string) {
  try {
    const dbUser = await prisma.user.upsert({
      where: { clerkUserId },
      update: {},
      create: { clerkUserId, email: `${clerkUserId}@internal.user`, password: "CLERK_MANAGED", name: "User" },
    });
    const session = await prisma.chatSession.upsert({
      where: { id: chatId },
      update: { updatedAt: new Date(), userId: dbUser.id },
      create: { id: chatId, userId: dbUser.id, title: userMsg.slice(0, 40) },
    });
    await prisma.chatMessage.createMany({
      data: [
        { chatSessionId: session.id, role: "USER", content: userMsg },
        { chatSessionId: session.id, role: "ASSISTANT", content: aiReply },
      ],
    });
  } catch (err) {
    console.error("DB save error:", err);
  }
}