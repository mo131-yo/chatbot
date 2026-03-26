"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface CartContextType {
  cartCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    try {
      const res = await fetch("/api/cart/controller"); // GET route-оо дуудна
      const data = await res.json();
      const count = data?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (error) {
      console.error("Cart fetch error:", error);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const res = await fetch("/api/cart/controller/add-item", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      });

      if (res.ok) {
        await refreshCart(); // Сагсны тоог шинэчлэх
        alert("Сагсанд нэмэгдлээ!");
      }
    } catch (error) {
      alert("Алдаа гарлаа");
    }
  };

  useEffect(() => { refreshCart(); }, []);

  return (
    <CartContext.Provider value={{ cartCount, addToCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};