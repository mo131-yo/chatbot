import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET Orders Error:", error);
    return NextResponse.json({ error: "Захиалга татахад алдаа гарлаа" }, { status: 500 });
  }
}




// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { orderId, total, items, customerName, customerPhone } = body;

//     const { userId: clerkId } = await auth();
//     if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const dbUser = await prisma.user.findUnique({
//       where: { clerkUserId: clerkId },
//     });
//     if (!dbUser) return NextResponse.json({ error: "User not found in database" }, { status: 404 });

//     if (!items || items.length === 0) {
//       return NextResponse.json({ error: "Сагс хоосон байна" }, { status: 400 });
//     }

//     const newOrder = await prisma.order.create({
//       data: {
//         id: orderId,
//         userId: dbUser.id,
//         productId: items[0].productId, 
//         quantity: items[0].quantity || 1,
//         price: Number(items[0].price),
//         totalAmount: Number(total),
//         status: "PAID",
//         customerName: customerName ?? "Guest",
//         customerPhone: customerPhone ?? "88888888",
//         address: "Online Order",
//         // /admin/api/orders/route.ts доторх POST хэсэг

// // /admin/api/orders/route.ts
// items: {
//   create: items.map((item: any) => ({
//     productId: item.id || item.productId,
//     productName: item.name,
//     // Энд 'item.image' гэж байгаа эсэхийг шалга. 
//     // Заримдаа 'item.images[0]' эсвэл 'item.imageUrl' байх тохиолдол бий.
//     productImage: item.image || (item.product?.images && item.product.images[0]), 
//     quantity: item.quantity,
//     price: Number(item.price),
//   })),
// },
//       },
//     });

//     return NextResponse.json({ success: true, order: newOrder });

//   } catch (error: any) {
//     console.error("CRITICAL PRISMA ERROR:", error);
//     return NextResponse.json(
//       { success: false, error: error.message || "Баазад хадгалахад алдаа гарлаа" },
//       { status: 500 }
//     );
//   }
// }


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, total, items, customerName, customerPhone } = body;

    console.log("FRONTEND-ЭЭС ИРСЭН БАРАА:", items[0]);
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkId },
    });
    if (!dbUser) return NextResponse.json({ error: "User not found in database" }, { status: 404 });

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Сагс хоосон байна" }, { status: 400 });
    }

    // ... бусад код хэвээрээ
const newOrder = await prisma.order.create({
  data: {
    id: orderId,
    userId: dbUser.id,
    productId: items[0].productId || items[0].id, 
    quantity: items[0].quantity || 1,
    price: Number(items[0].price),
    totalAmount: Number(total),
    status: "PAID",
    customerName: customerName ?? dbUser.name ?? "Guest",
    customerPhone: customerPhone ?? "88888888",
    address: "Online Order",
   items: {
  create: items.map((item: any) => ({
    productId: item.productId || item.id,
    // Сагснаас ирж болох бүх нэршлийг шалгах
    productName: item.name || item.productName || item.product_name || "Нэр тодорхойгүй", 
    // Сагснаас ирж болох бүх зургийн нэршлийг шалгах
    productImage: item.image || item.productImage || item.imageUrl || item.product_image_url || "", 
    quantity: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
  })),
},
  },
});

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error: any) {
    console.error("CRITICAL PRISMA ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Баазад хадгалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}