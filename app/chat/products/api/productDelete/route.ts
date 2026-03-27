import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const product = await prisma.product.delete({
      where: {
        id: Number(params.id),
      },
    });

    return NextResponse.json({
      message: "Бараа амжилттай устлаа",
      product,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Бараа устгахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}
