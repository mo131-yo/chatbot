import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.product.findUnique({
    where: { id: body.productId },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 400 });
  }

  if (!product.storeId) {
    return NextResponse.json(
      { message: "Store not found for this product" },
      { status: 400 },
    );
  }

  const quantity = Number(body.quantity) || 1;

  const order = await prisma.order.create({
    data: {
      productId: String(body.productId),
      storeId: product.storeId,
      userId: String(body.userId), // эсвэл Clerk
      quantity,
      price: product.price,
      totalAmount: product.price * quantity,
      customerPhone: String(body.phone),
      customerName: String(body.name),
      address: String(body.address),
      status: "PENDING",
    },
  });

  return NextResponse.json(order);
}
