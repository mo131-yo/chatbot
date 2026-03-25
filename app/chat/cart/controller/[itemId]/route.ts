import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { itemId: string } },
) {
  const { quantity } = await req.json();

  const updatedItem = await prisma.cartItem.update({
    where: {
      id: params.itemId,
    },
    data: {
      quantity,
    },
  });

  return Response.json(updatedItem);
}

export async function DELETE(
  req: Request,
  { params }: { params: { itemId: string } },
) {
  await prisma.cartItem.delete({
    where: {
      id: params.itemId,
    },
  });

  return Response.json({
    message: "Item removed",
  });
}
