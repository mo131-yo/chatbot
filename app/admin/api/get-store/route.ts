import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ success: true, storeName: "My Awesome Store" });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}