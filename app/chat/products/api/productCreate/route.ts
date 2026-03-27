import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      price,
      images,
      stock,
      color,
      size,
      rating,
      reviews,
      category,
      brand,
    } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        images,
        stock,
        color,
        size,
        rating,
        reviews,
        category,
        brand,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Product үүсгэхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
