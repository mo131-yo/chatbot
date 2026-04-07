import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
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
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("get session error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validRoles = ["USER", "ASSISTANT"];
    const toInsert = messages
      .filter(m => validRoles.includes(m.role?.toUpperCase()))
      .map(m => ({
        chatSessionId: sessionId,
        role: m.role.toUpperCase() as "USER" | "ASSISTANT",
        content: m.content || "",
      }));

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const session = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 },
      );
    }

    await prisma.chatSession.delete({
      where: {
        id: session.id,
      },
    });

    return NextResponse.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("delete session error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const body = await req.json();
    const title = body?.title?.trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: dbUser.id,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 },
      );
    }

    const updatedSession = await prisma.chatSession.update({
      where: {
        id: session.id,
      },
      data: {
        title,
      },
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error("PATCH session error:", error);
    return NextResponse.json(
      {
        error: "Failed to update session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
