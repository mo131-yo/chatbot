"use client";

import { useEffect, useState } from "react";
import CartItem from "./AddtoCartButton";

export default function CartList() {
  const [cart, setCart] = useState<any>(null);

  const loadCart = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();

    setCart(data);
  };

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
    <div>
      {cart.items.map((item: any) => (
        <CartItem key={item.id} item={item} refresh={loadCart} />
      ))}

      <button
        onClick={clearCart}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Clear Cart
      </button>
    </div>
  );
}
