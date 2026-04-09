"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Upload,
  PackagePlus,
  Info,
  ImageIcon,
  LayoutGrid,
  Loader2,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuccessToast } from "../ui/SuccessToast";

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: any;
  onClose?: () => void;
  storeName: string;
}

export default function ProductForm({
  onSuccess,
  initialData,
  onClose,
  storeName,
}: ProductFormProps) {
  const [open, setOpen] = useState(initialData ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    brand: "",
    category: "",
    stock: "",
    color: "",
    size: "",
  });

  const [previews, setPreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  useEffect(() => {
    if (initialData) {
      const meta = initialData.metadata || initialData;
      setFormData({
        name: meta.name || "",
        price: meta.price?.toString() || "",
        description: meta.description || "",
        brand: meta.brand || "",
        category: meta.category || "",
        stock: meta.stock?.toString() || "",
        color: meta.color || "",
        size: meta.size || "",
      });

      const currentImg = meta.imageUrl || meta.product_image_url;
      if (currentImg) {
        setPreviews([currentImg]);
      }
    }
  }, [initialData]);

  const handleSubmit = async () => {
  if (!storeName || storeName === "undefined") {
    return alert("Алдаа: Дэлгүүрийн нэр олдсонгүй.");
  }

    if (!storeName || storeName === "undefined" || storeName === "null") {
      return alert(
        "Алдаа: Дэлгүүрийн нэр (storeName) олдсонгүй. Та эхлээд дэлгүүрээ бүртгүүлсэн эсэхээ шалгана уу.",
      );
    }

    if (!formData.name || !formData.price) {
      return alert("Барааны нэр болон үнэ заавал байх ёстой!");
    }

    setIsSubmitting(true);
    try {
      let imageUrl = previews[0] || "";

      if (imageFiles.length > 0) {
        const cloudData = new FormData();
        cloudData.append("file", imageFiles[0]);
        cloudData.append("upload_preset", "my_store_preset");

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/dzljgphud/image/upload`,
          {
            method: "POST",
            body: cloudData,
          },
        );

        if (!uploadRes.ok) throw new Error("Зураг хуулахад алдаа гарлаа");

        const cloudJson = await uploadRes.json();
        imageUrl = cloudJson.secure_url;
      }

      // const payload = {
      //   ...formData,
      //   imageUrl,
      //   storeName: storeName,
      //   price: Number(formData.price),
      //   stock: Number(formData.stock || "0"),
      // };

      const payload = {
        ...formData,
        id: initialData?.id,
        imageUrl,
        storeName: storeName,
        price: Number(formData.price),
        stock: Number(formData.stock || "0"),
      };

      const response = await fetch("/admin/api/productAdd", {
        method: "POST",
        body: cloudData,
      });
      
      if (!uploadRes.ok) throw new Error("Зураг хуулахад алдаа гарлаа");
      const cloudJson = await uploadRes.json();
      imageUrl = cloudJson.secure_url;
    }

    const payload = {
      ...formData,
      id: initialData?.id, 
      imageUrl,
      storeName: storeName,
      price: Number(formData.price),
      stock: Number(formData.stock || "0"),
    };

    const endpoint = initialData ? "/admin/api/productUpdate" : "/admin/api/productAdd";
    const method = initialData ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

      if (data.success) {
        setToastMsg(
          initialData ? "Амжилттай шинэчлэгдлээ!" : "Амжилттай бүртгэгдлээ!",
        );
        setShowToast(true);

        if (!initialData) {
          setFormData({
            name: "",
            price: "",
            description: "",
            brand: "",
            category: "",
            stock: "",
            color: "",
            size: "",
          });
          setPreviews([]);
          setImageFiles([]);
        }

    if (data.success) {
      setToastMsg(initialData ? "Амжилттай шинэчлэгдлээ!" : "Амжилттай бүртгэгдлээ!");
      setShowToast(true);
      
      if (!initialData) {
          setFormData({ name: "", price: "", description: "", brand: "", category: "", stock: "", color: "", size: "" });
          setPreviews([]);
          setImageFiles([]);
      }

      setTimeout(() => {
        setOpen(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
    } else {
      alert(data.error || "Алдаа гарлаа");
    }
  } catch (error: any) {
    console.error("Submit Error:", error);
    alert(error.message || "Сервертэй холбогдоход алдаа гарлаа.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      {showToast && (
        <SuccessToast
          isVisible={showToast}
          message={toastMsg}
          onClose={() => setShowToast(false)}
        />
      )}

      {!initialData && (
        <Button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-5 rounded-xl shadow-lg active:scale-95 transition-all"
        >
          <PackagePlus className="w-5 h-5 mr-2" /> Бараа нэмэх
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[2.5rem] bg-gray-950 text-white border border-white/5 flex flex-col shadow-2xl">
            <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                  <PackagePlus className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight text-indigo-50">
                  {initialData ? "Бараа засах" : "Шинэ бараа бүртгэх"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  if (onClose) onClose();
                }}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X />
              </button>
            </header>

            <main className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3 space-y-8">
                  <Section
                    title="Үндсэн мэдээлэл"
                    icon={<Info className="w-4 h-4" />}
                  >
                    <div className="grid grid-cols-2 gap-5">
                      <FormInput
                        label="Барааны нэр"
                        value={formData.name}
                        onChange={(v: string) => handleInputChange("name", v)}
                      />
                      <FormInput
                        label="Үнэ (₮)"
                        type="number"
                        value={formData.price}
                        onChange={(v: string) => handleInputChange("price", v)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase tracking-widest">
                        Тайлбар
                      </label>
                      <textarea
                        placeholder="Барааны дэлгэрэнгүй тайлбар..."
                        value={formData.description}
                        className="w-full min-h-32 p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                      />
                    </div>
                  </Section>

                  <Section
                    title="Нэмэлт үзүүлэлт"
                    icon={<LayoutGrid className="w-4 h-4" />}
                  >
                    <div className="grid grid-cols-3 gap-4">
                      <FormInput
                        label="Брэнд"
                        value={formData.brand}
                        onChange={(v: string) => handleInputChange("brand", v)}
                      />
                      <FormInput
                        label="Категори"
                        value={formData.category}
                        onChange={(v: string) =>
                          handleInputChange("category", v)
                        }
                      />
                      <FormInput
                        label="Үлдэгдэл"
                        type="number"
                        value={formData.stock}
                        onChange={(v: string) => handleInputChange("stock", v)}
                      />
                    </div>
                  </Section>
                </div>

                <div className="lg:col-span-2">
                  <Section
                    title="Медиа"
                    icon={<ImageIcon className="w-4 h-4" />}
                  >
                    <div className="relative h-72 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden bg-white/2 hover:bg-white/5 transition-all group">
                      {previews.length > 0 ? (
                        <img
                          src={previews[0]}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto mb-2 text-indigo-400 group-hover:scale-110 transition-transform" />
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">
                            Зураг оруулах
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </div>
                  </Section>
                </div>
              </div>
            </main>

            <footer className="px-8 py-6 border-t border-white/5 flex gap-4 bg-white/2">
              <Button
                onClick={() => {
                  setOpen(false);
                  if (onClose) onClose();
                }}
                variant="ghost"
                className="flex-1 py-6 rounded-2xl text-gray-400"
              >
                Болих
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : initialData ? (
                  "Өөрчлөлтийг хадгалах"
                ) : (
                  "Барааг системд бүртгэх"
                )}
              </Button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, icon, children }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">
        <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
          {icon}
        </div>
        {title}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", ...props }: any) {
  return (
    <div className="flex-1 space-y-1">
      <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase tracking-widest">
        {label}
      </label>
      <input
        {...props}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-700"
      />
    </div>
  );
}
