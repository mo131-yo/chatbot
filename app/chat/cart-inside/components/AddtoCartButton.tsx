"use client";

import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    setLoading(true);

    await fetch("/api/cart/add-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        quantity: 1,
      }),
    });

    setLoading(false);
  };

  return (
    <button
      onClick={addToCart}
      className="bg-black text-white rounded-full px-4 py-2"
    >
      {loading ? "Adding..." : <FaShoppingCart />}
    </button>
  );
}
