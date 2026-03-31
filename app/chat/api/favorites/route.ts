import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, name, price, image, description, storeId } = body;

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const productSlug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    const product = await prisma.product.upsert({
      where: { id: productId },
      update: {},
      create: {
        id: productId,
        name: name,
        slug: productSlug,
        price: parseFloat(price) || 0,
        images: [image],
        description: description || "",
        status: "AVAILABLE",
        storeId: storeId || null,
      },
    });

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      return NextResponse.json({ saved: false, message: "Removed from favorites" });
    } else {
      const newFavorite = await prisma.favorite.create({
        data: {
          userId: user.id,
          productId: product.id,
        },
      });
      return NextResponse.json({ saved: true, data: newFavorite });
    }
  } catch (error: any) {
    console.error("FAVORITE_API_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}