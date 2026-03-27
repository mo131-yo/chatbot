import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();

    const product = await prisma.product.update({
      where: {
        id: Number(params.id),
      },
      data: {
        ...body, // 👈 partial update (хамгийн гоё нь)
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Бараа update хийхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
