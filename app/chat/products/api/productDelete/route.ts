import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  await prisma.product.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ message: "deleted" });
}
