import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID шаардлагатай" }, { status: 400 });
    }

    const body = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: { ...body },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Бараа шинэчлэхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}