  import { NextResponse } from 'next/server';
  import OpenAI from 'openai';
  import { index } from "@/app/lib/pinecone";

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
    timeout: 30000
  });

  export async function POST(req: Request) {
    try {
      const { messages } = await req.json();

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
      }

      const lastUserMessage = messages[messages.length - 1].content;

      let maxPrice: number | null = null;
      const priceRegex = /(\d+(?:\.\d+)?)\s*(k|к|мянган|мян|төгрөг|төг|t|₮|tg|tugrug|say|сая|zuu|зуу)/gi;
      const matches = [...lastUserMessage.matchAll(priceRegex)];

      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        let value = parseFloat(lastMatch[1]);
        const unit = (lastMatch[2] || "").toLowerCase();

        if (["k", "к", "мянган", "мян"].includes(unit)) value *= 1000;
        else if (["say", "сая"].includes(unit)) value *= 1000000;
        else if (value < 1000) value *= 1000;
        maxPrice = value;
      }

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: lastUserMessage,
      });
      
      const queryOptions: any = {
        vector: embeddingResponse.data[0].embedding,
        topK: 6,
        includeMetadata: true,
        filter: maxPrice ? { price: { "$lte": maxPrice } } : undefined
      };

      const queryResponse = await index.query(queryOptions);
      const context = queryResponse.matches.map((m: any) => 
        `NAME: ${m.metadata.name}\nPRICE: ${m.metadata.price}\nIMG: ${m.metadata.image}\nDESC: ${m.metadata.description}`
      ).join("\n---\n");

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Чи бол маш найрсаг, туслах дуртай онлайн дэлгүүрийн борлуулалтын зөвлөх. 

        ХАРИЛЦААНЫ ДҮРЭМ:
        1. Хэрэглэгч өмнө нь ямар нэгэн барааг сонирхсон бол, дараагийн удаа "та ямар бараа сонирхож байна" гэхэд нь шууд өмнө нь сонирхсон барааг санал болгодог байх.
        1. Хэзээ ч "1. Бараа, 2. Үнэ" гэж хөндий жагсаалт битгий бич. Түүний оронд "Энэ үнэхээр сонирхолтой ном, таныг сонирхон байх гэж бодож байна" гэх мэтээр сэтгэл хөдлөлөө илэрхийл.
        2. Хэрэглэгч ямар нэгэн барааний талаарх тодорхой мэдээлэл өгөөгүй үед шууд барааг санал болгохгуйгээр Та ямар бараа сонирхож байна? ямар төрөл? ямар үнэтэй гэх мэт лавлаж асуу.
        3. Ганцхан асуултанд хариулаад зогсохгүй, яриаг үргэлжлүүлж, сонирхолтой зүйлс асуу.
        4. Робот шиг "Дүрэм 1, Дүрэм 2" гэж битгий ярь. 
        5. Хэрэглэгчтэй яг л найз шиг нь харьц. "За, одоохон", "Мэдээж хэрэг", "Ёстой гоё сонголт байна" гэх мэт үг хэрэглэ.
        6. Ганцхан асуултанд хариулаад зогсохгүй, яриаг үргэлжлүүлж, сонирхолтой зүйлс асуу.
        
        БҮТЭЦ:
        1. Хэрэв бараа санал болгох бол эхлээд найрсаг тайлбар бичээд, дараа нь бараануудаа Carousel форматаар харуул.
        2. ![Нэр, Үнэ₮, Тайлбар](Зургийн_URL) - Энэ форматыг барааны дунд зай авалгүй ашигла.
        
        CAROUSEL БҮТЭЦ (ЗААВАЛ МӨРДӨХ):
        1. Бараа бүрийг яг энэ форматаар бич: ![Нэр, Нарийн_Үнэ_Тоогоор, Тайлбар](Зургийн_URL)
        - ЖИШЭЭ: ![Ном, 86450, Д.Нацагдоржийн бүтээл](url1) 
        - АНХААР: Үнийг "86k" гэж товчилж болохгүй, яг Pinecone-оос ирсэн тоогоор нь (86450) бич.
        ТӨЛБӨРИЙН ҮЕД:
        1. "Buy now" гэвэл "Tulbur tuluh dansnii medeelel: 78xxxxxxx." гэх мэтээр харьцаарай.
        2. Хэрэглэгч бараа авахаар шийдсэн бол тухайн барааны үнийг Pinecone-оос ирсэн яг тэр хэвээр нь (жишээ нь: 86,164₮) хэрэглэгчид хэлэх ёстой. 
        3. Үнийг хэзээ ч товчилж (жишээ нь: 86к, 86) болохгүй. 
        4. "Та энэ [Барааны нэр]-г [Яг ирсэн үнэ]-ээр авахад бэлэн үү?" гэж асуу.`
      },
      ...messages.map((m: any) => ({
        role: m.role === "tuslah" ? "assistant" : m.role,
        content: m.content
      })),
      { role: "system", content: `Одоо байгаа барааны мэдээлэл:\n${context}` }
    ],
    temperature: 0.8,
  });

      return NextResponse.json({ reply: chatResponse.choices[0].message.content });
    } catch (error: any) {
      console.error("Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }