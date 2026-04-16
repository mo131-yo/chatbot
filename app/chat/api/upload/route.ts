import { toProductJSON, imageToProducts } from "@/lib/api/productParser";
import { saveProduct } from "@/lib/api/saveProduct";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data, storeName } = body;

    if (!storeName) return NextResponse.json({ error: "Store name is required" }, { status: 400 });

    let products: any[] = [];

    if (type === "text") products = await toProductJSON(data);
    if (type === "image") products = await imageToProducts(data);

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid AI output" }, { status: 400 });
    }

    for (const product of products) {
      if (!product?.name) continue;
      await saveProduct(product, storeName);
    }

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}