import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    console.log("RECEIVED_BODY:", body);

    const { id, name, price, description, brand, category, stock, imageUrl, color, size } = body;

    if (!id) return NextResponse.json({ success: false, error: "ID олдсонгүй" }, { status: 400 });

    const categoryName = category || "Тодорхойгүй";
    const numericPrice = Number(price);
    const numericStock = parseInt(stock?.toString() || "0");

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { images: true, slug: true }
    });

    const finalImages = imageUrl 
      ? [imageUrl] 
      : (existingProduct?.images ?? []);

    const categoryRecord = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        slug: categoryName.toLowerCase().trim().replace(/\s+/g, '-')
      }
    });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: numericPrice,
        description: description || "",
        brand: brand || "",
        stock: numericStock,
        images: finalImages,
        colors: color ? [color] : [],
        sizes: size ? [size] : [],
        categoryName,
        categoryId: categoryRecord.id,
      }
    });
    console.log("RECEIVED_BODY:", body);
    console.log("ID:", id);
    console.log("IMAGE_URL:", imageUrl);
    console.log("UPDATED_PRODUCT:", updatedProduct);
    return NextResponse.json({ success: true, product: updatedProduct });

  } catch (error: any) {
    console.error("PRISMA_ERROR:", error.code, error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}