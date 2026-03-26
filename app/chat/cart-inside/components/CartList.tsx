"use client";

import { useEffect, useState } from "react";
import CartItem from "./CartItem";


export default function CartList() {
  const [cart, setCart] = useState<any>(null);

  const loadCart = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();

    setCart(data);
  };

  const totalPrice = cart.items.reduce((acc: number, item: any) => {
  return acc + (item.price * item.quantity);
}, 0);

  useEffect(() => {
    loadCart();
  }, []);

  if (!cart) return <p>Loading...</p>;

  if (!cart.items.length) return <p>Your cart is empty</p>;

  const clearCart = async () => {
    await fetch("/api/cart/clear", {
      method: "DELETE",
    });

    loadCart();
  };

  return (
    <div className="space-y-6">
      {cart.items.map((item: any) => (
        <CartItem key={item.id} item={item} refresh={loadCart} />
      ))}
      
      <div className="border-t border-white/10 pt-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Нийт дүн:</h2>
        <p className="text-2xl font-black text-[#C5A059]">{totalPrice.toLocaleString()} ₮</p>
      </div>
      
      <button className="w-full bg-[#C5A059] text-black font-bold py-4 rounded-xl hover:bg-white transition-all">
        Захиалах
      </button>
    </div>
  );
}
