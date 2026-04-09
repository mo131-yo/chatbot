import { index } from "@/lib/api/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    const body = await req.json(); 
    const { storeName } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!storeName) {
      return NextResponse.json({ error: "Дэлгүүрийн нэр дутуу байна" }, { status: 400 });
    }

    await index.namespace(storeName).upsert({
      records: [
        {
          id: `admin-${userId}`,
          values: new Array(1536).fill(0).map(() => Math.random()),
          metadata: {
            store_name: storeName,
            admin_id: userId,
            createdAt: new Date().toISOString(),
          },
        },
      ],
    });

    return NextResponse.json({ 
      success: true, 
      message: "Дэлгүүр амжилттай бүртгэгдлээ" 
    });

  } catch (error: any) {
    console.error("Pinecone Upsert Error:", error);
    return NextResponse.json(
      { error: "Сервер дээр алдаа гарлаа: " + error.message }, 
      { status: 500 }
    );
  }
}