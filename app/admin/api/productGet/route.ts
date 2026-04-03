import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID шаардлагатай" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { 
        id: id
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Бараа олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Сүлжээний алдаа гарлаа" },
      { status: 500 }
    );
  }
}