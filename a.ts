// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { auth } from "@clerk/nextjs/server";
// import { index } from "@/lib/api/pinecone";
// import { prisma } from "@/lib/prisma";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_KEY,
//   timeout: 30000,
// });

// type IncomingMessage = {
//   role: "USER" | "ASSISTANT" | "SYSTEM" | "user" | "assistant" | "system";
//   content: string;
// };

// function normalizeOpenAIRole(
//   role: IncomingMessage["role"]
// ): "user" | "assistant" | "system" {
//   const r = role.toLowerCase();
//   if (r === "user" || r === "assistant" || r === "system") return r as any;
//   return "user";
// }

// const ALL_NAMESPACES = [
//   "__default__",
//   "most_used_beauty_cosmetics-namespace",
//   "beauty-namespace",
//   "fashion-namespace",
//   "shoes-namespace",
//   "electronics-namespace",
//   "books-namespace",
// ];

// const NAMESPACE_KEYWORDS: Record<string, string[]> = {
//   "most_used_beauty_cosmetics-namespace": [
//     "гоо сайхан", "косметик", "beauty", "cosmetic", "крем", "cream",
//     "тоник", "сэрүүлэгч", "нүүр", "арьс", "шүршүүр", "лосьон",
//     "маск", "mask", "lipstick", "уруул", "нүдний", "eyeshadow",
//   ],
//   "beauty-namespace": [
//     "гоо", "beauty", "шампунь", "үс", "hair", "conditioner",
//     "серум", "serum", "мэйкап", "makeup", "foundation", "тушь",
//   ],
//   "fashion-namespace": [
//     "хувцас", "fashion", "цамц", "өмд", "dress", "jacket",
//     "coat", "хүрэм", "малгай", "hat", "дэгээ", "бүс", "belt",
//     "bag", "цүнх", "hoodie", "sweater", "pullover",
//   ],
//   "shoes-namespace": [
//     "гутал", "shoe", "sneaker", "boot", "сандал", "sandal",
//     "гүйлтийн", "спорт гутал", "heel", "өсгий",
//   ],
//   "electronics-namespace": [
//     "электрон", "утас", "phone", "laptop", "компьютер", "tablet",
//     "дэлгэц", "monitor", "earphone", "чихэвч", "speaker", "колонк",
//     "camera", "зурагт", "tv", "television", "цэнэглэгч", "charger",
//     "keyboard", "гар", "mouse", "хулгана", "watch", "цаг",
//     "iphone", "samsung", "xiaomi", "apple", "airpods",
//   ],
//   "books-namespace": [
//     "ном", "book", "тууж", "роман", "novel", "уншиx", "уншмаар",
//     "зохиол", "шүлэг", "poetry", "хүүхэд", "children", "сурах",
//     "textbook", "гарын авлага", "encyclopedia", "толь бичиг",
//   ],
// };

// function detectNamespaces(query: string): string[] {
//   const lower = query.toLowerCase();
//   const matched: string[] = [];

//   for (const [ns, keywords] of Object.entries(NAMESPACE_KEYWORDS)) {
//     if (keywords.some((kw) => lower.includes(kw))) {
//       matched.push(ns);
//     }
//   }

//   return matched.length > 0 ? matched : ALL_NAMESPACES;
// }

// function extractMaxPrice(text: string): number | null {
//   const priceRegex =
//     /(\d+(?:[.,]\d+)?)\s*(k|к|мянган|мян|төгрөг|төг|t|₮|tg|сая|say)/gi;
//   const matches = [...text.matchAll(priceRegex)];
//   if (matches.length === 0) return null;

//   const lastMatch = matches[matches.length - 1];
//   let value = parseFloat(lastMatch[1].replace(",", ""));
//   const unit = (lastMatch[2] || "").toLowerCase();

//   if (["k", "к", "мянган", "мян"].includes(unit)) value *= 1000;
//   else if (["сая", "say"].includes(unit)) value *= 1_000_000;
//   else if (value < 1000) value *= 1000;

//   return Number.isFinite(value) ? value : null;
// }

// const buildSystemPrompt = (context: string) => `
// Чи бол найрсаг онлайн дэлгүүрийн борлуулалтын зөвлөх. Хэрэглэгчтэй найз шиг харьц.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   БАРАА ХАРУУЛАХ ФОРМАТ (ЗААВАЛ)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Бараа санал болгохдоо ЗААВАЛ доорх форматыг ашигла. Нэг бараа = нэг мөр.

// ![Нэр, Үнэ, Тайлбар, ProductID, StoreID](SEARCH_IMAGE_PLACEHOLDER)

//   Зөв жишээ:
// ![Nike Air Max 90, 125000, Гүйлтэд зориулсан, abc123, store001](SEARCH_IMAGE_PLACEHOLDER)
// ![Д.Нацагдорж - Цагаан сар, 18500, Монгол шүлгийн түүвэр, book-042, store002](SEARCH_IMAGE_PLACEHOLDER)

//   ХЭЗЭЭ Ч ХИЙХГҮЙ:
// - URL өөрөө зохиохгүй (loremflickr, unsplash г.м.)
// - SEARCH_IMAGE_PLACEHOLDER-г өөр зүйлээр орлуулахгүй — систем автоматаар солино
// - ProductID, StoreID орхихгүй — Pinecone ID-г заавал ашигла

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    ХАЙЛТ БА САНАЛ БОЛГОХ ДҮРЭМ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. Хэрэглэгч ТОДОРХОЙ бараа нэрлэсэн → Context-оос тохирох 10 барааг харуул.
// 2. Хэрэглэгч ЕРӨНХИЙ зүйл хэлсэн → Нэг асуулт тавьж тодруул, дараа санал болго.
// 3. Хэрэглэгч ШИНЭ бараа нэрлэвэл → өмнөх барааг мартаад шинийг хай.
// 4. "Өмнөхийг", "тэр барааг" гэвэл → өмнөх барааруу буц.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   ХАРИЛЦААНЫ ХЭЛБЭР
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// - Найрсаг, богино өгүүлбэрээр ярь: "За, одоохон", "Ёстой гоё сонголт" гэх мэт
// - Роботоор "Дүрэм 1, Дүрэм 2" гэж хэзээ ч ярихгүй

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   ХУДАЛДАН АВАЛТ / ТӨЛБӨР
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Хэрэглэгч "авна", "захиална", "buy", "order" гэвэл:
// 1. Үнийг товчилж болохгүй ("86к" биш "86,164₮")
// 2. "Та энэ [Барааны нэр]-г [Үнэ]-ээр авахад бэлэн үү?" гэж асуу
// 3. Хэрэглэгч "Тийм" гэвэл ЗӨВХӨН:
//    PAYMENT_TRIGGER:{"id":"бараа_id","name":"бараа нэр","price":үнэ_тоогоор}
// 4. Хэрэглэгч "Үгүй" гэвэл: "За ойлголоо! Өөр бараа үзмээр байна уу?"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ОДООГИЙН БАРААНУУДЫН МЭДЭЭЛЭЛ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${context}`;

// export async function POST(req: Request) {
//   try {
//     const { userId: clerkUserId } = await auth();
//     const body = await req.json();

//     const messages = body?.messages as IncomingMessage[] | undefined;
//     const chatId = body?.chatId as string | undefined;
//     const fallbackUserId = body?.userId as string | undefined;

//     if (!messages || !Array.isArray(messages) || messages.length === 0) {
//       return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
//     }

//     const lastUserMessage = messages[messages.length - 1]?.content?.trim();
//     if (!lastUserMessage) {
//       return NextResponse.json({ error: "Last message content is required" }, { status: 400 });
//     }

//     const maxPrice = extractMaxPrice(lastUserMessage);

//     const targetNamespaces = detectNamespaces(lastUserMessage);
//     console.log(`🔍 Query: "${lastUserMessage}"`);
//     console.log(`📂 Namespaces: [${targetNamespaces.join(", ")}]`);
//     console.log(`💰 Max price: ${maxPrice ?? "unlimited"}`);

//     let context = "";
//     try {
//       const embedding = await openai.embeddings.create({
//         model: "text-embedding-3-small",
//         input: lastUserMessage,
//       });

//       const queryPromises = targetNamespaces.map((ns) =>
//         index
//           .namespace(ns === "__default__" ? "" : ns)
//           .query({
//             vector: embedding.data[0].embedding,
//             topK: 8,
//             includeMetadata: true,
//             ...(maxPrice ? { filter: { formatted_price: { $lte: maxPrice } } } : {}),
//           })
//           .catch((err) => {
//             console.warn(`Namespace "${ns}" query failed:`, err.message);
//             return { matches: [] };
//           })
//       );

//       const queryResults = await Promise.all(queryPromises);
//       const allMatches = queryResults.flatMap((res) => res.matches || []);

//       const seen = new Set<string>();
//       const topMatches = allMatches
//         .sort((a, b) => (b.score || 0) - (a.score || 0))
//         .filter((m) => {
//           if (seen.has(m.id)) return false;
//           seen.add(m.id);
//           return true;
//         })
//         .slice(0, 10);

//       console.log(`✅ Found ${topMatches.length} matches (from ${allMatches.length} total)`);

//       context = topMatches
//         .map(
//           (m: any) =>
//             `ID: ${m.id}
//               Нэр: ${m.metadata?.product_name || m.metadata?.name || "Нэргүй"}
//               Үнэ: ${m.metadata?.formatted_price || m.metadata?.price || "Тодорхойгүй"}₮
//               Зураг: ${m.metadata?.product_image_url || m.metadata?.image_url || ""}
//               Тайлбар: ${m.metadata?.description || ""}
//               Score: ${(m.score || 0).toFixed(3)}`
//         )
//         .join("\n---\n");
//     } catch (err) {
//       console.error("Vector Search Error:", err);
//     }

//     const chatResponse = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: buildSystemPrompt(context) },
//         ...messages.map((m) => ({
//           role: normalizeOpenAIRole(m.role),
//           content: m.content,
//         })),
//       ],
//       temperature: 0.4,
//     });

//     const aiReply =
//       chatResponse.choices[0]?.message?.content?.trim() || "Хариу олдсонгүй.";

//     const effectiveUserId = clerkUserId || fallbackUserId;
//     const isGuestSession = chatId?.startsWith("guest_");

//     if (effectiveUserId && chatId && !isGuestSession) {
//       try {
//         const dbUser = await prisma.user.upsert({
//           where: { clerkUserId: effectiveUserId },
//           update: {},
//           create: {
//             clerkUserId: effectiveUserId,
//             email: `${effectiveUserId}@internal.user`,
//             password: "CLERK_MANAGED",
//             name: "User",
//           },
//         });

//         const session = await prisma.chatSession.upsert({
//           where: { id: String(chatId) },
//           update: { updatedAt: new Date(), userId: dbUser.id },
//           create: {
//             id: String(chatId),
//             userId: dbUser.id,
//             title: lastUserMessage.slice(0, 40),
//           },
//         });

//         await prisma.chatMessage.createMany({
//           data: [
//             { chatSessionId: session.id, role: "USER", content: lastUserMessage },
//             { chatSessionId: session.id, role: "ASSISTANT", content: aiReply },
//           ],
//         });
//       } catch (dbError: any) {
//         console.error("PRISMA_SAVE_ERROR:", dbError);
//       }
//     }

//     return NextResponse.json({ reply: aiReply });
//   } catch (error: any) {
//     console.error("API_GLOBAL_ERROR:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error", details: error?.message || "Unknown error" },
//       { status: 500 }
//     );
//   }
// }