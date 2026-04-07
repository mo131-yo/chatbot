import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const body = await req.json();
    const messages: { role: string; content: string }[] = body?.messages || [];

    if (!messages.length) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: dbUser.id },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const validRoles = ["USER", "ASSISTANT"];
    const toInsert = messages
      .filter(m => validRoles.includes(m.role?.toUpperCase()))
      .map(m => ({
        chatSessionId: sessionId,
        role: m.role.toUpperCase() as "USER" | "ASSISTANT",
        content: m.content || "",
      }));

    await prisma.chatMessage.createMany({ data: toInsert });

    return NextResponse.json({ saved: toInsert.length });
  } catch (error) {
    console.error("bulk-save messages error:", error);
    return NextResponse.json({ error: "Failed to save messages" }, { status: 500 });
  }
}