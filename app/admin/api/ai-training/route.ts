// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(req: Request) {
//   try {
//     const { userId } = await auth();
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const user = await prisma.user.findUnique({
//       where: { clerkUserId: userId },
//       include: { stores: true },
//     });

//     if (!user || user.stores.length === 0) {
//       return NextResponse.json({ error: "No store found" }, { status: 404 });
//     }

//     const storeId = user.stores[0].id;
//     const instruction = await prisma.aIInstruction.findFirst({
//       where: { storeId, isActive: true },
//     });

//     return NextResponse.json({
//       success: true,
//       instruction: instruction || {
//         instruction: "Сайн мэндээ! Манай дэлгүүрээр хэргээ туслаарай.",
//         tone: "friendly",
//         discountPercent: 0,
//         urgencyLevel: "normal",
//       },
//     });
//   } catch (error) {
//     console.error("GET_AI_INSTRUCTION_ERROR:", error);
//     return NextResponse.json({ error: "Internal Error" }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const { userId } = await auth();
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const user = await prisma.user.findUnique({
//       where: { clerkUserId: userId },
//       include: { stores: true },
//     });

//     if (!user || user.stores.length === 0) {
//       return NextResponse.json({ error: "No store found" }, { status: 404 });
//     }

//     const storeId = user.stores[0].id;
//     const body = await req.json();

//     const { instruction, tone, promotionText, discountPercent, urgencyLevel } = body;

//     await prisma.aIInstruction.updateMany({
//       where: { storeId },
//       data: { isActive: false },
//     });

//     const newInstruction = await prisma.aIInstruction.create({
//       data: {
//         storeId,
//         instruction: instruction || "Сайн мэндээ! Манай дэлгүүрээр хэргээ туслаарай.",
//         tone: tone || "friendly",
//         promotionText: promotionText || null,
//         discountPercent: discountPercent || 0,
//         urgencyLevel: urgencyLevel || "normal",
//         isActive: true,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Зааварчилгаа амжилттай хадгалагдлаа!",
//       instruction: newInstruction,
//     });
//   } catch (error) {
//     console.error("POST_AI_INSTRUCTION_ERROR:", error);
//     return NextResponse.json({ error: "Internal Error" }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const store = await prisma.store.findUnique({
      where: { userId: userId }, 
      include: { aiInstruction: true }
    });

    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: store.aiInstruction || {
        promotionText: "",
        couponCode: "",
        priorityItems: "",
        tone: "friendly"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { storeName, promotionText, couponCode, priorityItems, tone } = body;

    const store = await prisma.store.findFirst({
      where: { 
        name: storeName,
        userId: userId 
      }
    });

    if (!store) return NextResponse.json({ error: "Store not found or access denied" }, { status: 404 });

    const updatedInstruction = await prisma.aIInstruction.upsert({
      where: { storeId: store.id },
      update: { 
        promotionText, 
        couponCode, 
        priorityItems, 
        tone 
      },
      create: { 
        storeId: store.id, 
        promotionText, 
        couponCode, 
        priorityItems, 
        tone 
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "AI амжилттай суралцлаа!",
      data: updatedInstruction 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}