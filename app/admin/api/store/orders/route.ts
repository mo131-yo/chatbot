import prisma from "@/lib/prisma";
import { url } from "inspector";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const storeId = new URL(req.url).searchParams.get("storeId");

  const orders = await prisma.order.findMany({
    where: { storeId: storeId || undefined },
    include: { product: true },
  });
  return NextResponse.json(orders);
}
