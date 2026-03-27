// import { NextResponse } from "next/server";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/prisma";
// import { getOrCreateUser } from "@/lib/clerk/clerk";

// export async function GET() {
//   try {
//     const { userId } = await auth();
 
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
 
//     const clerkUser = await currentUser();
 
//     if (!clerkUser) {
//       return NextResponse.json(
//         { error: "Clerk user not found" },
//         { status: 404 },
//       );
//     }
 
//     const dbUser = await getOrCreateUser(clerkUser);
 
//     const chats = await prisma.chatSession.findMany({
//       where: {
//         userId: dbUser.id,
//       },
//       include: {
//         messages: {
//           orderBy: {
//             createdAt: "asc",
//           },
//         },
//       },
//       orderBy: {
//         updatedAt: "desc",
//       },
//     });
 
//     return NextResponse.json({ chats });
//   } catch (error) {
//     console.error("CHAT HISTORY ERROR:", error);
 
//     return NextResponse.json(
//       { error: "Failed to fetch chat history" },
//       { status: 500 },
//     );
//   }
// }



import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Нэвтэрнэ үү" }, { status: 401 });
  }

  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        user: { clerkUserId: clerkId }
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Дата татахад алдаа гарлаа" }, { status: 500 });
  }
}