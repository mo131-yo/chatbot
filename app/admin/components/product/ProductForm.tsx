"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { useUploadThing } from "@/utils/uploadthing";

export default function ProductForm({ onSuccess }: any) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  


const { startUpload } = useUploadThing("imageUploader");

const handleSubmit = async () => {
  try {
    if (imageFiles.length === 0) {
      alert("Зураг сонгоно уу!");
      return;
    }

    // 1. UploadThing рүү зургуудаа хуулна
    const uploadRes = await startUpload(imageFiles);
    
    if (!uploadRes) {
      throw new Error("Зураг хуулахад алдаа гарлаа");
    }

    const uploadedUrls = uploadRes.map(file => file.url);

    // 2. Өөрийн API (Pinecone-той) руу мэдээллээ илгээнэ
    const response = await fetch("/admin/api/productCreate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price: Number(price),
        images: uploadedUrls, // Одоо UploadThing-ийн URL-ууд очиж байна
        category,
        brand,
        color,
        size,
        stock: Number(stock),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Хадгалахад алдаа гарлаа");
    }

    const data = await response.json();
    if (data.success) {
      alert(`Амжилттай хадгалагдлаа! ID: ${data.id}`);
      setOpen(false);
      resetForm();
      onSuccess();
    }
  } catch (error: any) {
    console.error("Алдаа:", error);
    alert(error.message);
  }
};

  const resetForm = () => {
    setName("");
    setPrice("");
    setImageFiles([]);
    setPreviews([]);
    setDescription("");
    setBrand("");
    setCategory("");
    setColor("");
    setSize("");
    setStock("");
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Бараа нэмэх</Button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="
            w-120 max-h-[90vh] overflow-y-auto p-6 rounded-2xl
            bg-gray-900 text-white
            dark:bg-white dark:text-black
            border border-white/10 dark:border-gray-200
            shadow-2xl space-y-6 transition-all duration-300
          "
          >
            <h2 className="text-xl font-bold">🛒 Шинэ бараа нэмэх</h2>

            <Section title="Basic Info">
              <Input label="Барааны нэр" value={name} set={setName} />
              <Input
                label="Барааны үнэ"
                type="number"
                value={price}
                set={setPrice}
              />
            </Section>

            <Section title="Зураг">
              <div
                className="
    relative border-2 border-dashed rounded-xl p-4
    bg-gray-800 dark:bg-gray-100
    flex flex-col items-center justify-center
    cursor-pointer hover:opacity-80 transition
  "
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;

                    setImageFiles((prev) => [...prev, ...files]);

                    const newPreviews = files.map((file) =>
                      URL.createObjectURL(file),
                    );

                    setPreviews((prev) => [...prev, ...newPreviews]);
                  }}
                />

                <p className="text-sm text-gray-400 dark:text-gray-600">
                  Click or drag multiple images
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {previews.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      className="w-full h-24 object-cover rounded-lg"
                    />

                    <button
                      onClick={() => {
                        setPreviews((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                        setImageFiles((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                      }}
                      className="
          absolute top-1 right-1
          bg-red-500 text-white text-xs px-2 py-1 rounded
        "
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Тайлбар">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-22.5"
              />
            </Section>

            <Section title="Дэлгэрэнгүй">
              <Input label="Брэнд" value={brand} set={setBrand} />
              <Input label="Категори" value={category} set={setCategory} />
              <Input label="Color" value={color} set={setColor} />
              <Input label="Size" value={size} set={setSize} />
              <Input label="Stock" type="number" value={stock} set={setStock} />
            </Section>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="
                flex-1 py-2 rounded-lg
                bg-gray-700 text-white
                dark:bg-gray-200 dark:text-black
              "
              >
                Болих
              </button>

              <button
                onClick={handleSubmit}
                className="
                flex-1 py-2 rounded-lg
                bg-indigo-600 text-white hover:opacity-90
              "
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-100 space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-600">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Input({ label, value, set, type = "text" }: any) {
  return (
    <div>
      <label className="text-xs text-gray-400 dark:text-gray-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => set(e.target.value)}
        className="
        w-full mt-1 p-2 rounded-lg
        bg-gray-800 text-white
        dark:bg-white dark:text-black
        border border-transparent
        focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
        outline-none transition
      "
      />
    </div>
  );
}
