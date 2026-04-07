"use client";
import { useState } from "react";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "",
    brand: "", color: "", size: "", stock: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/admin/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Бараа амжилттай нэмэгдлээ!");
        setForm({ name: "", description: "", price: "", category: "", brand: "", color: "", size: "", stock: "" });
        setImageFile(null);
        setImagePreview("");
      } else {
        setMessage(`❌ Алдаа: ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Сервер алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Шинэ бараа нэмэх</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Зураг upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Барааны зураг</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-lg" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs">✕</button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="text-gray-400 py-8">
                  <p>Зураг сонгоно уу</p>
                  <p className="text-xs">PNG, JPG, WEBP</p>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {[
          { key: "name", label: "Барааны нэр *", required: true },
          { key: "description", label: "Тайлбар *", required: true },
          { key: "price", label: "Үнэ (₮)", type: "number" },
          { key: "brand", label: "Брэнд" },
          { key: "category", label: "Категори" },
          { key: "color", label: "Өнгө" },
          { key: "size", label: "Хэмжээ" },
          { key: "stock", label: "Үлдэгдэл тоо", type: "number" },
        ].map(({ key, label, type = "text", required }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type={type}
              required={required}
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Нэмж байна..." : "Бараа нэмэх"}
        </button>
      </form>
    </div>
  );
}