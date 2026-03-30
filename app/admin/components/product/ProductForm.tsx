"use client";

import { useState } from "react";
import { Button } from "../ui/button";

export default function ProductForm({ onSuccess }: any) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState("");
  const [description, setDescription] = useState("");

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        images,
        description,
        color,
        size,
        brand,
        stock: Number(stock),
        category,
      }),
    });

    // RESET
    setOpen(false);
    setName("");
    setPrice("");
    setImages("");
    setDescription("");
    setColor("");
    setSize("");
    setBrand("");
    setStock("");
    setCategory("");

    onSuccess();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Бараа нэмэх</Button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl w-[420px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg mb-4">Шинэ бараа нэмэх</h2>

            {/* NAME */}
            <input
              placeholder="Барааны нэр"
              className="w-full mb-3 p-2 bg-gray-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* PRICE */}
            <input
              placeholder="Үнэ"
              type="number"
              className="w-full mb-3 p-2 bg-gray-800"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            {/* IMAGE */}
            <input
              placeholder="Зураг URL"
              className="w-full mb-3 p-2 bg-gray-800"
              value={images}
              onChange={(e) => setImages(e.target.value)}
            />

            {images && (
              <img
                src={images}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}

            {/* DESCRIPTION */}
            <textarea
              placeholder="Тайлбар"
              className="w-full mb-3 p-2 bg-gray-800"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* BRAND */}
            <input
              placeholder="Brand"
              className="w-full mb-3 p-2 bg-gray-800"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />

            {/* CATEGORY */}
            <input
              placeholder="Category"
              className="w-full mb-3 p-2 bg-gray-800"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            {/* COLOR */}
            <input
              placeholder="Color (жишээ: red, black)"
              className="w-full mb-3 p-2 bg-gray-800"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />

            {/* SIZE */}
            <input
              placeholder="Size (жишээ: S, M, L)"
              className="w-full mb-3 p-2 bg-gray-800"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />

            {/* STOCK */}
            <input
              placeholder="Stock (тоо ширхэг)"
              type="number"
              className="w-full mb-3 p-2 bg-gray-800"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />

            {/* BUTTONS */}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSubmit}>Хадгалах</Button>
              <Button onClick={() => setOpen(false)}>Болих</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}