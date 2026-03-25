import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getUserFromToken();
  const { productId, quantity } = await req.json();

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return Response.json({ message: "Product not found" }, { status: 404 });
  }

  let cart = await prisma.cart.findUnique({
    where: { userId: user.id },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: user.id },
    });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
      },
    });
  }

  return Response.json({ message: "Item added" });
}
