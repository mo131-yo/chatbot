import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/service/auth";

export async function DELETE() {
  const user = await getUserFromToken();

  const cart = await prisma.cart.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!cart) {
    return Response.json({});
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return Response.json({
    message: "Cart cleared",
  });
}
