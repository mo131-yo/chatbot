import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

// ✅ GET by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return Response.json({ message: "Not found" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const productId = new URL(req.nextUrl)
      .toString()
      .split("/products")[1]
      .split("/")[1];
    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id: productId },
      data: body,
    });

    return Response.json(updated);
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });

    return Response.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
