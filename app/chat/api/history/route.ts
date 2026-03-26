import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/clerk/route";

export async function GET() {
  try {
    const { userId } = await auth();
 
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    const clerkUser = await currentUser();
 
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Clerk user not found" },
        { status: 404 },
      );
    }
 
    const dbUser = await getOrCreateUser(clerkUser);
 
    const chats = await prisma.chatSession.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
 
    return NextResponse.json({ chats });
  } catch (error) {
    console.error("CHAT HISTORY ERROR:", error);
 
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 },
    );
  }
}