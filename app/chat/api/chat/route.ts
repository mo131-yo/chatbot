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

      const namespaces = ["Orgil's shop"];

      const queryPromises = namespaces.map((ns) =>
        index.namespace(ns).query({
          vector: embedding.data[0].embedding,
          topK: 10,
          includeMetadata: true,
          filter: maxPrice ? { price: { $lte: maxPrice } } : undefined,
        }),
      );

      const queryResults = await Promise.all(queryPromises);
      const allMatches = queryResults.flatMap((res) => res.matches || []);

      const topMatches = allMatches
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);

      context = topMatches
        .map(
          (m) =>
            `БҮТЭЭГДЭХҮҮН: ${m.metadata?.name || "Нэргүй"}
            ҮНЭ: ${m.metadata?.price || null}₮
            ЗУРАГ: ${m.metadata?.product_image_url || m.metadata?.image_url || ""}
            ТАЙЛБАР: ${m.metadata?.description || "Тайлбар байхгүй"}
            ID: ${m.id}
            STORE_ID: ${m.metadata?.store_id || "store-001"}`,
        )
        .join("\n---\n");

      console.log("Олдсон барааны тоо:", topMatches.length);
    } catch (err) {
      console.error("Vector Search Error:", err);
    }

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          // FIX: Use | (pipe) as separator in the image markdown format.
          // This avoids conflicts with Mongolian text that naturally contains commas.
          // Format: ![Нэр|Үнэ|Тайлбар|ProductID|StoreID](Зургийн_URL)
          content: `Чи бол зөвхөн өгөгдсөн Context (Pinecone дата) дээр үндэслэн ажилладаг Монголын хамгийн ухаалаг "Shopping Assistant" юм.
          
 --- ЧУХАЛ: ХАТУУ ХЯЗГААРЛАЛТ (CRITICAL RULES) ---
      1. ЗӨВХӨН CONTEXT АШИГЛА: Өгөгдсөн Context дотор байхгүй барааг хэзээ ч бүү зохио. Хэрэв Context дотор хэрэглэгчийн хайсан бараа (жишээ нь: Nike) байхгүй бол "Уучлаарай, манайд яг одоо [барааны нэр] алга байна" гэж хариул.
      2. ХӨНДЛӨНГИЙН МЭДЛЭГ ХОРИГЛОХ: Өөрийн сургагдсан мэдээллийн санд байгаа (Nike, Adidas, Apple гэх мэт) ерөнхий мэдлэгээ ашиглан бараа санал болгохыг ХАТУУ ХОРИГЛОНО. 
      3. ЗУРГИЙН ДҮРЭМ: Зөвхөн Context дотор ирсэн 'image_url' эсвэл 'ЗУРАГ' линкийг ашигла. Хэрэв Context-д зураг байхгүй бол зургийн хэсгийг хоосон орхи эсвэл "Зураггүй бараа" гэж тэмдэглэ. ХЭЗЭЭ Ч гадны (loremflickr, google гэх мэт) линк бүү ашигла.
      4. TEMPERATURE CHECK: Чи маш бодит (grounded) байх ёстой. Барааны нэр, үнэ, тайлбар бүгд Context-той 100% таарах ёстой.

      --- ХАРИЛЦААНЫ ХЭЛБЕР ---
      - Найрсаг, эелдэг, туслахад бэлэн бай (✨, 😊).
      - Хэрэглэгчийг сонголтоо тодорхой болгоход нь туслах асуулт асуу (Жишээ нь: "Танд ямар хэмжээтэй нь хэрэгтэй вэ?").

      --- БАРАА ХАРУУЛАХ ФОРМАТ (MARKDOWN) ---
      Бараа бүрийг заавал дараах форматаар харуулна:
      ![Нэр|Үнэ|Тайлбар|ProductID|StoreID](Зургийн_URL)
      
      *Санамж: Тусгаарлагч нь ЗААВАЛ | (pipe) байх ёстой.*

      --- ТӨЛБӨРИЙН ЛОГИК ---
      Хэрэглэгч захиалъя эсвэл авъя гэвэл:
      "Маш зөв сонголт! Одоо танд төлбөрийн мэдээллийг хүргэе." гээд доорхыг хавсарга:
      PAYMENT_TRIGGER:{"id":"id","name":"name","price":price}

      --- CONTEXT (ӨГӨГДӨЛ) ---
      [Энд Pinecone-оос ирсэн хайлтын үр дүнгүүд (metadata) байрлана]
 
      --- ХЭРЭГЛЭГЧИЙН КОНТЕКСТ ---
      ${context}`,
        },
        ...messages.map((m) => ({
          role: normalizeOpenAIRole(m.role),
          content: m.content,
        })),
      ],
      temperature: 0.8,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
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
