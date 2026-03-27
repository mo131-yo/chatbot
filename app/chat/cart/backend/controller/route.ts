export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

// export async function GET() {
//   const user = await getUserFromToken();

//   const cart = await prisma.cart.findUnique({
//     where: { userId: user.id },
//     include: {
//       items: {
//         include: {
//           product: true,
//         },
//       },
//     },
//   });

//   return Response.json(cart);
// }

export async function GET() {
  try {
    const user = await getUserFromToken().catch(() => null);
    if (!user) return Response.json({ items: [] });

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    }); // Eniig bas bi haraahan testleegui bgaa

    return Response.json(cart || { items: [] });
  } catch (error) {
    return Response.json({ items: [] });
  }
}