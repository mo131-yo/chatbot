"use client";

import { useState } from "react";

export default function CartItem({ item, refresh }: any) {
  const [quantity, setQuantity] = useState(item.quantity);

  const updateQuantity = async (value: number) => {
    setQuantity(value);

    await fetch(`/api/cart/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: value,
      }),
    });

    refresh();
  };

  const removeItem = async () => {
    await fetch(`/api/cart/${item.id}`, {
      method: "DELETE",
    });

    refresh();
  };

  return (
    <div className="flex justify-between border-b py-4">
      <div>
        <h3 className="font-semibold">{item.product.name}</h3>
        <p>${item.price}</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => updateQuantity(Number(e.target.value))}
          className="border w-16 text-center"
        />

        <button onClick={removeItem} className="text-red-500">
          Remove
        </button>
      </div>
    </div>
  );
}
