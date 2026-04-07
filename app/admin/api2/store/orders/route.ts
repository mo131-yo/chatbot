import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    const orders = await prisma.order.findMany({
      // Хэрэв storeId ирвэл шүүнэ, ирэхгүй бол бүгдийг авна
      where: storeId ? { 
        items: {
          some: {
            productId: { contains: "" } // Энд шаардлагатай бол логикоо нэмнэ
          }
        }
      } : {},
      include: {
        items: true, // Эндээс productName, productImage-ээ авна
        user: {
          select: {
            name: true,
            email: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Хэрэв баазад user байхгүй (Зочин) бол алдаа заахаас сэргийлж 
    // JSON буцаахдаа анхаарна уу.
    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ GET Orders API Error:", error);
    return NextResponse.json(
      { error: "Захиалга авахад алдаа гарлаа" }, 
      { status: 500 }
    );
  }
}