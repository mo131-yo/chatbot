"use client";

import React, { useEffect, useState } from "react";
import { X, Upload, PackagePlus, Info, ImageIcon, LayoutGrid, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { SuccessToast } from "../ui/SuccessToast";

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: any;
  onClose?: () => void;
}

const getInitialImage = (data: any): string[] => {
  if (!data) return [];
  if (data.product_image_url) return [data.product_image_url];
  if (Array.isArray(data.images) && data.images.length > 0) return [data.images[0]];
  if (data.image) return [data.image];
  return [];
};

const getCurrentImageUrl = (data: any): string => {
  if (!data) return "";
  if (data.product_image_url) return data.product_image_url;
  if (Array.isArray(data.images) && data.images.length > 0) return data.images[0];
  if (data.image) return data.image;
  return "";
};

export default function ProductForm({ onSuccess, initialData, onClose }: ProductFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuth();

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    brand: "",
    category: "",
    stock: "",
    color: "",
    size: "",
  });

  const [previews, setPreviews] = useState<string[]>(getInitialImage(initialData));
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (initialData) {
      setOpen(true);
      setFormData({
        id: initialData.id || "",
        name: initialData.name || "",
        price: initialData.price?.toString() || "",
        description: initialData.description || "",
        brand: initialData.brand || "",
        category: initialData.category?.name || initialData.categoryName || "",
        stock: initialData.stock?.toString() || "",
        color: Array.isArray(initialData.colors) ? initialData.colors[0] : (initialData.color || ""),
        size: Array.isArray(initialData.sizes) ? initialData.sizes[0] : (initialData.size || ""),
      });

      setPreviews(getInitialImage(initialData));
      setImageFiles([]);
    }
  }, [initialData]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
    if (!initialData) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ id: "", name: "", price: "", description: "", brand: "", category: "", color: "", size: "", stock: "" });
    setImageFiles([]);
    setPreviews([]);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      return alert("Нэр болон үнэ заавал байх ёстой");
    }

    setIsSubmitting(true);
    try {
      let permanentImageUrl = getCurrentImageUrl(initialData);

      if (imageFiles.length > 0) {
        const file = imageFiles[0];
        const cloudData = new FormData();
        cloudData.append("file", file);
        cloudData.append("upload_preset", "my_store_preset");
        cloudData.append("folder", `stores/${userId}`);

        const CLOUD_NAME = "dzljgphud";
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: cloudData
        });

        const cloudJson = await uploadRes.json();
        if (cloudJson.secure_url) {
          permanentImageUrl = cloudJson.secure_url;
        }
      }

      const endpoint = initialData ? "/admin/api/productUpdate" : "/admin/api/productAdd";
      
      const payload = {
        ...formData,
        id: initialData?.id || formData.id || `prod_${Date.now()}`, 
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock || "0"),
        imageUrl: permanentImageUrl,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setToastMsg(initialData ? "DATABASE RE-SYNCHRONIZED" : "Success",);
        setShowToast(true);
        
        setTimeout(() => {
          handleClose();
          if (onSuccess) onSuccess();
        }, 1000); 
      } else {
        alert("Системийн алдаа: " + data.error);
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert("Холболтын алдаа: " + errorMessage);
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-5 rounded-xl shadow-indigo-500/20 shadow-lg transition-all active:scale-95"
        >
          <PackagePlus className="w-5 h-5 mr-2" /> Бараа нэмэх
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[2.5rem] bg-gray-950 text-white shadow-2xl flex flex-col border border-white/5">

            <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gray-950/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                  <PackagePlus className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {initialData ? "Барааны мэдээлэл засах" : "Шинэ бараа бүртгэх"}
                  </h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-semibold">Inventory Control</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </header>

            <main className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3 space-y-8">
                  <Section title="Үндсэн мэдээлэл" icon={<Info className="w-4 h-4" />}>
                    <div className="grid grid-cols-2 gap-5">
                      <FormInput label="Барааны нэр" placeholder="Nike Air..." value={formData.name} onChange={(v: any) => handleInputChange('name', v)} />
                      <FormInput label="Үнэ (₮)" type="number" placeholder="0.00" value={formData.price} onChange={(v: any) => handleInputChange('price', v)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Дэлгэрэнгүй тайлбар</label>
                      <textarea
                        value={formData.description}
                        onChange={e => handleInputChange('description', e.target.value)}
                        placeholder="Барааны шинж чанар..."
                        className="w-full min-h-32 p-4 rounded-2xl bg-white/5 border border-white/5 text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-gray-600"
                      />
                    </div>
                  </Section>

                  <Section title="Нэмэлт үзүүлэлт" icon={<LayoutGrid className="w-4 h-4" />}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                      <FormInput label="Брэнд" value={formData.brand} onChange={(v: any) => handleInputChange('brand', v)} />
                      <FormInput label="Категори" value={formData.category} onChange={(v: any) => handleInputChange('category', v)} />
                      <FormInput label="Үлдэгдэл" type="number" value={formData.stock} onChange={(v: any) => handleInputChange('stock', v)} />
                    </div>
                  </Section>
                </div>

                <div className="lg:col-span-2">
                  <Section title="Медиа" icon={<ImageIcon className="w-4 h-4" />}>
                    <div className="relative group h-72 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/2 hover:bg-white/4 transition-all flex flex-col items-center justify-center gap-3 overflow-hidden">
                      {previews.length > 0 ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img src={previews[previews.length - 1]} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => { setPreviews([]); setImageFiles([]); }}
                              className="p-3 bg-red-500 rounded-full shadow-xl hover:scale-110 transition-transform"
                            >
                              <X className="w-5 h-5 text-white" />
                            </button>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            onChange={handleFileChange}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="p-4 bg-indigo-500/10 rounded-2xl">
                            <Upload className="w-6 h-6 text-indigo-400" />
                          </div>
                          <p className="text-[11px] font-medium text-gray-400">Зургийг энд чирж оруулна уу</p>
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileChange} />
                        </>
                      )}
                    </div>
                  </Section>
                </div>
              </div>
            </main>

            <footer className="px-8 py-6 bg-white/5 border-t border-white/5 flex gap-4">
              <Button onClick={handleClose} variant="ghost" className="flex-1 py-6 rounded-2xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                Болих
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-2 py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-indigo-500/10 shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? "Хадгалах" : "Барааг бүртгэх")}
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
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">{icon}</div>
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", placeholder = "" }: any) {
  return (
    <div className="flex-1 space-y-2">
      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-700"
      />
    </div>
  );
}