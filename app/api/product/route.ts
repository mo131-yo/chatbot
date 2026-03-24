import { NextRequest } from "next/server";
type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock?: number;
  color?: string;
  size?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  brand?: string;
};

export async function POST(request: NextRequest) {
  const { name, price, description, imageUrl } = await request.json();

  // Энд та бүтээгдэхүүнийг хадгалах логикыг нэмж болно (жишээ нь, өгөгдлийн сантай холбогдох)

  try {
    const newProduct: Product = {
      id: Math.floor(Math.random() * 1000),
      name,
      price,
      description,
      imageUrl,
      stock: 0,
      size: "",
      rating: 0,
      reviews: 0,
      category: "",
      brand: "",
    };

    // Бүтээгдэхүүнийг хадгалах логикыг энд нэмж болно

    return new Response(JSON.stringify(newProduct), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create product" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
