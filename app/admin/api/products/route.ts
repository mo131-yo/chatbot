import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({ include: { store: true } });
  return Response.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("BODY:", body);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: Number(body.price), // 🔥 safeguard
        brand: body.brand,
        category: body.category,
        storeId: body.storeId,
        stock: body.stock || 0,
        images: body.images || [],
        colors: body.colors || [],
        sizes: body.sizes || [],
      },
    });

    return Response.json(product);
  } catch (error) {
    console.error("ERROR:", error);
    return Response.json({ error }, { status: 500 });
  }
}
