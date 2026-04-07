import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not synced to database" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const title = body?.title?.trim() || "New Chat";

    const session = await prisma.chatSession.create({
      data: {
        title,
        userId: dbUser.id,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("create session error:", error);
    return NextResponse.json(
      {
        error: "Failed to create chat session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
