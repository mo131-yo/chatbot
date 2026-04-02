import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: Number(params.id),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Бараа олдсонгүй" }, { status: 404 });
  }
}
