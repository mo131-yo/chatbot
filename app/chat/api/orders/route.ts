import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, totalAmount, customerPhone, address } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Сагс хоосон байна" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkUserId: clerkId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    try{
    const order = await prisma.order.create({
      data: {
        userId: dbUser.id,
        productId: items[0].productId, 
        totalAmount: parseFloat(totalAmount),
        price: parseFloat(totalAmount),
        customerPhone: customerPhone || "99990000",
        address: address || "Default Address",
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
    }catch(error){
      console.error("PRISMA ERROR:", error); 
    return NextResponse.json({ error: "Захиалга үүсгэхэд алдаа гарлаа" }, { status: 500 });
    }

    // return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("ORDER_CREATE_ERROR:", error);
    return NextResponse.json({ error: "Захиалга үүсгэхэд алдаа гарлаа", details: String(error) }, { status: 500 });
  }
}