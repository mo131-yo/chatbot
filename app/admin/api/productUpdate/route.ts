// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// export async function POST(req: Request) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
//     const {
//       id,
//       name,
//       price,
//       description,
//       brand,
//       category,
//       stock,
//       imageUrl,
//       color,
//       size,
//     } = body;

//     if (!id) {
//       return NextResponse.json({ success: false, error: "ID олдсонгүй" }, { status: 400 });
//     }

//     const categoryName = category || "General";
//     const numericPrice = parseFloat(price) || 0;
//     const numericStock = parseInt(stock?.toString() || "0", 10);

//     const categoryRecord = await prisma.category.upsert({
//       where: { name: categoryName },
//       update: {},
//       create: {
//         name: categoryName,
//         slug: categoryName.toLowerCase().trim().replace(/\s+/g, "-"),
//       },
//     });

//     const updatedProduct = await prisma.product.upsert({
//       where: { id: id },
//       update: {
//         name,
//         price: numericPrice,
//         description: description || "",
//         brand: brand || "",
//         stock: numericStock,
//         images: imageUrl ? [imageUrl] : undefined,
//         colors: color ? [color] : [],
//         sizes: size ? [size] : [],
//         categoryName: categoryRecord.name,
//         categoryId: categoryRecord.id,
//       },
//       create: {
//         id: id,
//         name,
//         price: numericPrice,
//         description: description || "",
//         brand: brand || "",
//         stock: numericStock,
//         images: imageUrl ? [imageUrl] : [],
//         colors: color ? [color] : [],
//         sizes: size ? [size] : [],
//         categoryName: categoryRecord.name,
//         categoryId: categoryRecord.id,
//         slug: name?.toLowerCase().trim().replace(/\s+/g, "-") || `prod-${Date.now()}`,
//       },
//     });

//     console.log("✅ PRISMA SUCCESS:", updatedProduct.id);
//     return NextResponse.json({ success: true, product: updatedProduct });
//   } catch (error: any) {
//     console.error("PRISMA_ERROR:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const body = await req.json();
    const {
      id,
      name,
      price,
      description,
      brand,
      category,
      stock,
      imageUrl,
      color,
      size,
    } = body;

    if (!id)
      return NextResponse.json(
        { success: false, error: "ID шаардлагатай" },
        { status: 400 },
      );

    const numericPrice = parseFloat(price) || 0;
    const numericStock = parseInt(stock?.toString() || "0", 10);

    const categoryName = category || "General";

    const categoryRecord = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        slug: categoryName.toLowerCase().trim().replace(/\s+/g, "-"),
      },
    });

    const updatedProduct = await prisma.product.upsert({
      where: { id: id },
      update: {
        name,
        price: numericPrice,
        description: description || "",
        brand: brand || "",
        stock: numericStock,
        images: imageUrl ? [imageUrl] : undefined,

        category: {
          connect: { id: categoryRecord.id },
        },
      },
      create: {
        id: id,
        name,
        price: numericPrice,
        description: description || "",
        brand: brand || "",
        stock: numericStock,
        images: imageUrl ? [imageUrl] : [],
        slug:
          name?.toLowerCase().trim().replace(/\s+/g, "-") ||
          `prod-${Date.now()}`,
        // ЭНД ХОЛБОЛТЫГ НЭМЭХ:
        category: {
          connect: { id: categoryRecord.id },
        },
      },
    });

    // 2. PINECONE ШИНЭЧЛЭХ (Хайлт болон Жагсаалт)
    // Санамж: Векторыг шинэчлэхгүйгээр зөвхөн Metadata-г шинэчилж байна
    await index.namespace(userId).update({
      id: id,
      metadata: {
        name: name,
        price: numericPrice,
        product_image_url: imageUrl || "",
        description: description || "",
        category: category || "General",
        brand: brand || "Unknown",
        stock: numericStock,
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("UPDATE_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
