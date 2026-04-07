"use client";
import { useState } from "react";
import { UploadButton } from "../../lib/uploadthing";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "",
    brand: "", color: "", size: "", stock: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return alert("Зураг оруулна уу!");
    
    setLoading(true);
    try {
      const res = await fetch("/admin/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl }), // Зургийн URL-тай хамт явуулна
      });

      const data = await res.json();
      if (data.success) {
        alert("Амжилттай хадгалагдлаа!");
        // Form-оо цэвэрлэх...
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Шинэ бараа нэмэх</h1>
      
      {/* UploadThing товчлуур */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Барааны зураг</label>
        {imageUrl ? (
          <div className="relative w-full h-48">
            <img src={imageUrl} className="w-full h-full object-cover rounded-xl" />
            <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">✕</button>
          </div>
        ) : (
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              setImageUrl(res[0].url);
              alert("Зураг амжилттай хуулагдлаа");
            }}
            onUploadError={(error: Error) => alert(`Алдаа: ${error.message}`)}
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Бусад input-үүд (Нэр, Үнэ г.м) */}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
          {loading ? "Хадгалж байна..." : "Pinecone руу илгээх"}
        </button>
      </form>
    </div>
  );
}