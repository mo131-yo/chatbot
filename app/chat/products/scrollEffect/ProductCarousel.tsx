"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { ProductDetailSidebar } from "../detail/ProductDetailSidebar";
import { HorizontalProductStack } from "../components/HorizontalProductStack";
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
  const [savedProducts, setSavedProducts] = useState<string[]>([]);

  if (!products || products.length === 0) return null;

  const handleBuy = (name: string, price: string) => {
    console.log(`Buy triggered for: ${name} at ${price}`);
  };

  function handleSend(opt: string): void {
    throw new Error("Function not implemented.");
  }

  
  const handleSaveProduct = async (product: any) => {
    const isAlreadySaved = savedProducts.includes(product.id);
    if (isAlreadySaved) {
      setSavedProducts(prev => prev.filter(id => id !== product.id));
    } else {
      setSavedProducts(prev => [...prev, product.id]);
    }
    try {
      await fetch("/chat/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          storeId: product.storeId 
        }),
      });
    } catch (error) {
      console.error("Save error:", error);
    }
  };
  
  return (
    <div className="w-full">
      <HorizontalProductStack 
        products={products} 
        onSelect={(product) => setSelectedProduct(product)} 
        onBuy={handleBuy}
        onSave={handleSaveProduct}
        savedIds={savedProducts}
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