"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { HorizontalProductStack } from "../components/VerticalProductStack";
import { ProductDetailSidebar } from "../detail/ProductDetailSidebar";
interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
}

interface ProductCarouselProps {
  products: any[]; 
  onSelect: (product: any) => void;
  onBuy: (name: string, price: any) => void;
  history: any[];
}

export const ProductCarousel = ({ products, history  }: ProductCarouselProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  if (!products || products.length === 0) return null;

  const handleBuy = (name: string, price: string) => {
    console.log(`Buy triggered for: ${name} at ${price}`);
  };

  function handleSend(opt: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="w-full">
      <HorizontalProductStack 
        products={products} 
        onSelect={(product) => setSelectedProduct(product)} 
        onBuy={handleBuy}
      />

      {selectedProduct && (
        <ProductDetailSidebar 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuy={handleBuy}
        />
      )}
    </div>
  );
};