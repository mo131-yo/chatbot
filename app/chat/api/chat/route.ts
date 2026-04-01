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
  return "system";
}

function extractMaxPrice(text: string): number | null {
  const priceRegex = /(\d+(?:\.\d+)?)\s*(k|к|мянган|мян|төгрөг|төг|t|₮|tg|tugrug|say|сая|zuu|зуу)/gi;
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
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content?.trim();
    if (!lastUserMessage) {
      return NextResponse.json({ error: "Last message content is required" }, { status: 400 });
    }

    let context = "";
    const maxPrice = extractMaxPrice(lastUserMessage);

    try {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: lastUserMessage,
      });

      const queryResponse = await index.query({
        vector: embeddingResponse.data[0].embedding,
        topK: 10,
        includeMetadata: true,
        filter: maxPrice ? { price: { $lte: maxPrice } } : undefined,
      });

      context = (queryResponse.matches || [])
        .map((m: any) => `ID: ${m.id}, Нэр: ${m?.metadata?.name}, Үнэ: ${m?.metadata?.price}, Тайлбар: ${m?.metadata?.description}`)
        .join("\n");
    } catch (err) {
      console.error("Vector Search Error:", err);
      context = "Барааны мэдээлэл олдсонгүй.";
    }
  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Чи бол найрсаг, туслах дуртай онлайн дэлгүүрийн борлуулалтын зөвлөх. 

        ХАРИЛЦААНЫ ДҮРЭМ:
        1. Хэрэглэгч өмнө нь ямар нэгэн барааны талаар дэлгэрэнгүй мэдээлэл (Жишээ нь барааны төрөл, үнэ, брэнд гэх мэт мэдээллүүд ) өгөөгүй үед шууд бараа санал болгохгүйгээр эхлээд
        1. Хэрэглэгч өмнө нь ямар нэгэн барааг сонирхсон бол, дараагийн удаа "та ямар бараа сонирхож байна" гэхэд нь шууд өмнө нь сонирхсон барааг санал болгодог байх.
        1. Хэзээ ч "1. Бараа, 2. Үнэ" гэж хөндий жагсаалт битгий бич. Түүний оронд "Энэ үнэхээр сонирхолтой ном, таныг сонирхох байх гэж бодож байна" гэх мэтээр сэтгэл хөдлөлөө илэрхийл.
        2. Хэрэглэгч ямар нэгэн барааний талаарх тодорхой мэдээлэл өгөөгүй үед шууд барааг санал болгохгуйгээр Та ямар бараа сонирхож байна? ямар төрөл? ямар үнэтэй гэх мэт лавлаж асуу.
        3. Ганцхан асуултанд хариулаад зогсохгүй, яриаг үргэлжлүүлж, сонирхолтой зүйлс асуу.
        4. Робот шиг "Дүрэм 1, Дүрэм 2" гэж битгий ярь. 
        5. Хэрэглэгчтэй яг л найз шиг нь харьц. "За, одоохон", "Мэдээж хэрэг", "Ёстой гоё сонголт байна" гэх мэт үг хэрэглэ.
        6. Ганцхан асуултанд хариулаад зогсохгүй, яриаг үргэлжлүүлж, сонирхолтой зүйлс асуу.
        
        БҮТЭЦ:
        1. ![Нэр, Үнэ, Тайлбар, ID](Зургийн_URL) - Энэ форматыг ашигла.
        2.Бүтээгдэхүүн санал болгохдоо заавал дараах Markdown форматыг ашигла:
          ![Нэр, Үнэ, Тайлбар, ProductID, StoreID](Зургийн_URL)
           Жишээ: > ![L'Oreal шампунь, 25000, Гүн чийгшүүлэгч, beauty-1, store-001](https://example.com/shampoo.jpg)
        
        CAROUSEL БҮТЭЦ (ЗААВАЛ МӨРДӨХ):
        1. Бараа бүрийг яг энэ форматаар бич: ![Нэр, Үнэ_Тоогоор, Тайлбар, ID](Зургийн_URL)
          - ЖИШЭЭ: ![Ном, 86450, Д.Нацагдорж, 550e8400-e29b-41d4-a716-446655440000](url1)
          - АНХААР: ID талбарт Pinecone-оос ирсэн бодит ID-г заавал бич.
        
        ТӨЛБӨРИЙН ҮЕД:
        1. "Buy now" гэвэл "Tulbur tuluh dansnii medeelel: 78xxxxxxx." гэх мэтээр харьцаарай.
        2. Хэрэглэгч бараа авахаар шийдсэн бол тухайн барааны үнийг Pinecone-оос ирсэн яг тэр хэвээр нь (жишээ нь: 86,164₮) хэрэглэгчид хэлэх ёстой. 
        3. Үнийг хэзээ ч товчилж (жишээ нь: 86к, 86) болохгүй. 
        4. "Та энэ [Барааны нэр]-г [Яг ирсэн үнэ]-ээр авахад бэлэн үү?" гэж асуу.
        5. Хэрэглэгч "Тийм" гэж хэлвэл "Төлбөрийн заавар: 78xxxxxxx" гэх мэтээр харьцаарай.
        6. Хэрэглэгч "Үгүй" гэж хэлвэл "За, ойлголоо. Магадгүй өөр бараа сонирхох уу?" гэх мэтээр харьцаарай.`,
      },
      ...messages.map((m: any) => ({
      role: (m.role === "ASSISTANT" || m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
      content: m.content,
    })),
      { 
      role: "system" as const, 
      content: `Одоо байгаа барааны мэдээлэл:\n${context}` 
    }
    ],
    temperature: 0.8,
  });

    const aiReply=chatResponse.choices[0]?.message?.content?.trim() || "Хариу олдсонгүй.";

    const effectiveUserId = clerkUserId || fallbackUserId;

    if (effectiveUserId && chatId) {
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
            title: lastUserMessage.slice(0, 40),
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
