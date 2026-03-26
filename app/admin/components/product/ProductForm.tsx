"use client";

import { useState } from "react";
import { Button } from "../ui/button";

export default function ProductForm({ onSuccess }: any) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async () => {
    await fetch("api/products", {
      method: "POST",
      body: JSON.stringify({ name, price: Number(price) }),
    });

    setOpen(false);
    setName("");
    setPrice("");
    onSuccess();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Бараа нэмэх</Button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-900 p-6. rounded-xl w-96">
            <h2 className="text-lg mb-4">Шинэ бараа нэмэх</h2>

            <input
              placeholder="Барааны нэр"
              className="w-full mb-3 p-2 bg-gray-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Барааны үнэ"
              className="w-full mb-3 p-2 bg-gray-800"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <div className="flex gap-2">
              <Button onClick={handleSubmit}>Хадгалах</Button>
              <Button onClick={() => setOpen(false)}>Болих</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
