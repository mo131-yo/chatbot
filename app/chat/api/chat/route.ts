import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { index } from "@/lib/api/pinecone";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  timeout: 30000,
});

type IncomingMessage = {
  role: "USER" | "ASSISTANT" | "SYSTEM" | "user" | "assistant" | "system";
  content: string;
};

function normalizeOpenAIRole(
  role: IncomingMessage["role"],
): "user" | "assistant" | "system" {
  const r = role.toLowerCase();
  if (r === "user" || r === "assistant" || r === "system") return r as any;
  return "user";
}

function extractMaxPrice(text: string): number | null {
  const priceRegex =
    /(\d+(?:\.\d+)?)\s*(k|к|мянган|мян|төгрөг|төг|t|₮|tg|tugrug|say|сая|zuu|зуу)/gi;
  const matches = [...text.matchAll(priceRegex)];
  if (matches.length === 0) return null;

  const lastMatch = matches[matches.length - 1];
  let value = parseFloat(lastMatch[1]);
  const unit = (lastMatch[2] || "").toLowerCase();

  if (["k", "к", "мянган", "мян"].includes(unit)) value *= 1000;
  else if (["say", "сая"].includes(unit)) value *= 1000000;
  else if (value < 1000) value *= 1000;

  return Number.isFinite(value) ? value : null;
}

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    const body = await req.json();

    const messages = body?.messages as IncomingMessage[] | undefined;
    const chatId = body?.chatId as string | undefined;
    const fallbackUserId = body?.userId as string | undefined;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    const lastUserMessage = messages[messages.length - 1]?.content?.trim();
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "Last message content is required" },
        { status: 400 },
      );
    }

    const priceRegex = /(\d+(?:\.\d+)?)\s*(k|к|мянган|мян|төг|₮)/gi;
    const match = priceRegex.exec(lastUserMessage);
    let maxPrice: number | undefined;
    if (match) {
      maxPrice = parseFloat(match[1]);
      if (
        match[2] &&
        ["k", "к", "мянган", "мян"].includes(match[2].toLowerCase())
      )
        maxPrice *= 1000;
    }

    let context = "";
    try {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: lastUserMessage,
      });

      const namespaces = [
        "",
        "most_used_beauty_cosmetics-namespace",
        "beauty-namespace",
        "fashion-namespace",
        "shoes-namespace",
        "electronics-namespace",
        "books-namespace",
        "user_3BSwyjfHAMPysPTaXqJ5CkAIGfM"
      ];

      const queryPromises = namespaces.map((ns) =>
        index.namespace(ns).query({
          vector: embedding.data[0].embedding,
          topK: 8,
          includeMetadata: true,
          filter: maxPrice
            ? { formatted_price: { $lte: maxPrice } }
            : undefined,
        }),
      );

      const queryResults = await Promise.all(queryPromises);
      const allMatches = queryResults.flatMap((res) => res.matches || []);

      
    // ... Pinecone query хийсний дараа
const topMatches = allMatches
  .sort((a, b) => (b.score || 0) - (a.score || 0))
  .slice(0, 10);

// ЭНЭ ХЭСГИЙГ ӨӨРЧЛӨХ:
// ЭНЭ ХЭСГИЙГ ӨӨРЧЛӨХ (context-ийг илүү тодорхой болгох):
context = topMatches
  .map(
    (m) =>
      `БҮТЭЭГДЭХҮҮН: ${m.metadata?.product_name || m.metadata?.name || "Нэргүй"}
       ҮНЭ: ${m.metadata?.formatted_price || m.metadata?.price}₮
       ЗУРАГ: ${m.metadata?.product_image_url || m.metadata?.image_url || m.metadata?.image || ""}
       ТАЙЛБАР: ${m.metadata?.description || "Тайлбар байхгүй"}
       ID: ${m.id}
       STORE_ID: ${m.metadata?.store_id || "store-001"}`
  )
  .join("\n---\n");
    } catch (err) {
      console.error("Vector Search Error:", err);
    }

const chatResponse = await openai.chat.completions.create({
  model: "gpt-4o-mini", // Хэрэв боломжтой бол 'gpt-4o' ашиглавал бүр илүү ухаалаг болно
  messages: [
    {
      role: "system",
      content: `Чи бол Монголын хамгийн ухаалаг, найрсаг онлайн дэлгүүрийн "Senior Shopping Assistant" юм. Чиний зорилго бол зүгээр л бараа зарах биш, хэрэглэгчийн амьдралын хэв маягт тохирсон хамгийн зөв сонголтыг хийхэд нь туслах "Shopping Consultant" байх юм.

      --- ХАРИЛЦААНЫ СТРАТЕГИ (ADVANCED PERSONA) ---
      1. Эмпати ба Мэдрэмж: Хэрэглэгчийн хэрэгцээг мэдэр. Жишээ нь: "Удахгүй орох баяр наадмаар өмсөх гоёлын гутал хайж байна уу?" эсвэл "Оройн гоёлд тань энэ цүнх маш сайн зохицно гэдэгт итгэлтэй байна" гэх мэтээр сэтгэл хөдлөл нэм.
      2. Эргэцүүлэн бодох (Reasoning): Хэрэглэгч "Nike гутал байна уу?" гэвэл шууд жагсаахын оронд "Мэдээж, Nike бол чанар. Танд гүйлтийн зориулалттай нь хэрэгтэй юу, эсвэл өдөр тутам өмсөх Street-style сонирхож байна уу?" гэж тодруулж асуу.
      3. Үнийн сэтгэл зүй: Хямд барааг "боломжийн үнэтэй", үнэтэй барааг "чанартай бөгөөд тансаг, урт хугацааны хэрэглээ" гэж тодорхойл.
      4. Сэтгэл хөдлөлийн илэрхийлэл: Найрсаг Emoji (✨, 🛍️, 🙌, 😊) ашигла. Хэзээ ч робот шиг нэг хэвийн хариулж болохгүй.

      --- БАРАА ХАРУУЛАХ ТУШААЛ (ХАТУУ ДҮРЭМ) ---
      - Бараа санал болгохын өмнө хэрэглэгчийн сонголтыг магтсан эсвэл тайлбарласан 1-2 өгүүлбэр бич.
      - Бараануудыг ЗӨВХӨН дараах Markdown форматыг ашиглаж харуулна:
        ![Нэр, Үнэ, Тайлбар, ProductID, StoreID](Зургийн_URL)
      - Текстээр барааны жагсаалт (1. Гутал, 2. Цүнх гэх мэт) ХЭЗЭЭ Ч бүү гарга.

      --- ЗУРГИЙН УТГА (CONTEXTUAL IMAGES) ---
      - Context доторх 'ЗУРАГ' линкийг ашигла.
      - Хэрэв зураг байхгүй бол: https://loremflickr.com/800/800/{item_name_english,shopping} ашиглана.

      --- TRANSACTIONAL LOGIC ---
      1. Захиалга өгөх үед: "Маш зөв сонголт! Энэ бараа танд таалагдана гэдэгт 100% итгэлтэй байна. Одоо захиалгыг тань үүсгэе." гээд PAYMENT_TRIGGER-ээ хавсарга.
      2. PAYMENT_TRIGGER Формат: PAYMENT_TRIGGER:{"id":"id","name":"name","price":price}
      3. Үнийг товчилж болохгүй (Жишээ нь: 150k биш 150,000₮ гэх).

      --- ХЭРЭГЛЭГЧИЙН КОНТЕКСТ ---
      ${context}`,
    },
    ...messages.map((m) => ({
      role: normalizeOpenAIRole(m.role),
      content: m.content,
    })),
  ],
  temperature: 0.8, // Бага зэрэг нэмэгдүүлснээр хариулт илүү "Human-like" (хүн шиг) болно
  presence_penalty: 0.6, // Нэг үгээ олон дахин давтахаас сэргийлнэ
  frequency_penalty: 0.5, // Илүү баялаг үгсийн сантай хариулт өгнө
});

    const aiReply =
      chatResponse.choices[0]?.message?.content?.trim() || "Хариу олдсонгүй.";

    const effectiveUserId = clerkUserId || fallbackUserId;
    const isGuestSession = chatId?.startsWith("guest_");

    if (effectiveUserId && chatId && !isGuestSession) {
      try {
        const stringChatId = String(chatId);

        const dbUser = await prisma.user.upsert({
          where: { clerkUserId: effectiveUserId },
          update: {},
          create: {
            clerkUserId: effectiveUserId,
            email: `${effectiveUserId}@internal.user`,
            password: "CLERK_MANAGED",
            name: "User",
          },
        });

        const session = await prisma.chatSession.upsert({
          where: { id: stringChatId },
          update: {
            updatedAt: new Date(),
            userId: dbUser.id,
          },
          create: {
            id: stringChatId,
            userId: dbUser.id,
            title: lastUserMessage.slice(0, 40),
          },
        });

        await prisma.chatMessage.createMany({
          data: [
            {
              chatSessionId: session.id,
              role: "USER",
              content: lastUserMessage,
            },
            {
              chatSessionId: session.id,
              role: "ASSISTANT",
              content: aiReply,
            },
          ],
        });
      } catch (dbError: any) {
        console.error("PRISMA_SAVE_ERROR:", dbError);
      }
    }

    return NextResponse.json({ reply: aiReply });
  } catch (error: any) {
    console.error("API_GLOBAL_ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
