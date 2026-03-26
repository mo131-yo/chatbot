import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { stringify } from "querystring";

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.product.findUnique({
    where: { id: body.productId },
  });
  if (!product) {
    NextResponse.json({ message: "Product not found" }, { status: 400 });
    return;
  }

  const order = await prisma.order.create({
    data: {
      productId: body.productId,
      storeId: product.storeId || stringify({}),
      quantity: body.quantity || 1,
      price: product.price,
      customerPhone: body.phone,
      customerName: body.name,
      address: body.address,
      status: "PENDING",
    },
  });
  return NextResponse.json(order);
}
