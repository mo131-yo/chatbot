import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  const storeId = params.storeId;
  const products = await prisma.product.findMany({
    where: { storeId },
  });
  return NextResponse.json(products);
}
