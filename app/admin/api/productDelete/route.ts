import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id; 

    const product = await prisma.product.delete({
      where: { id },
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