import { index } from "@/lib/api/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json(); 
    const storeName = body.storeName;

    if (!userId || !storeName) return NextResponse.json({ error: "Data missing" }, { status: 400 });

    await index.namespace(storeName).upsert({
      records: [
        {
          id: userId,
          values: new Array(1536).fill(0).map(() => Math.random() * 0.01), 
          metadata: {
            store_name: storeName,
            admin_id: userId,
          },
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}