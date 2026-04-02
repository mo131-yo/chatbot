"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState } from "react";

interface Props {
  onClose: () => void;
}

const LocationPicker = dynamic(
  () => import('./LocationPicker'),
  { 
    ssr: false,
    loading: () => <div className="h-300px w-full bg-white/5 animate-pulse rounded-xl" /> 
  }
);
const LOCATION_DATA: Record<string, string[]> = {
  "Улаанбаатар": ["Баянгол", "Баянзүрх", "Сонгинохайрхан", "Чингэлтэй", "Хан-Уул", "Сүхбаатар", "Налайх", "Багануур"],
  "Дархан": ["Дархан сум", "Орхон сум", "Шарын гол", "Хонгор"],
  "Эрдэнэт": ["Баян-Өндөр", "Жаргалант"]
};

export default function OrderAddress({ onClose }: Props) {
  const [formData, setFormData] = useState({
    city: "",
    district: "",
    address: "",
    phone: "",
    lat: 47.9188,
    lng: 106.9176
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "city") {
      setFormData(prev => ({ ...prev, city: value, district: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMapChange = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    setLoading(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=mn`
      );
      const data = await response.json();

      if (data.address) {
        const addr = data.address;
        
        let detectedCity = "";
        if (addr.city === "Ulaanbaatar" || addr.state === "Ulaanbaatar") detectedCity = "Улаанбаатар";
        else if (addr.city === "Darkhan" || addr.state === "Darkhan-Uul") detectedCity = "Дархан";
        else if (addr.city === "Erdenet" || addr.state === "Orkhon") detectedCity = "Эрдэнэт";

        const detectedDistrict = addr.suburb || addr.district || addr.county || "";

        const detailedAddress = [
          addr.road,
          addr.neighbourhood,
          addr.house_number
        ].filter(Boolean).join(", ");

        setFormData(prev => ({
          ...prev,
          city: detectedCity || prev.city,
          district: detectedDistrict,
          address: detailedAddress || prev.address
        }));
      }
    } catch (error) {
      console.error("Хаяг авахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[#121212] border border-white/10 rounded-[32px] overflow-hidden w-full max-w-lg z-10 shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-white">Хүргэлтийн хаяг тохируулах</h2>
          <p className="text-sm text-slate-400">Газрын зураг дээр байршлаа заана уу</p>
        </div>

        <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          <div className="w-full">
            <LocationPicker 
              onLocationSelect={handleMapChange} 
              initialPos={[formData.lat, formData.lng]} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-widest">Хот / Аймаг</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#C5A059] appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-[#121212]">Сонгох</option>
                {Object.keys(LOCATION_DATA).map(city => (
                  <option key={city} value={city} className="bg-[#121212]">{city}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-widest">Дүүрэг / Сум</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                disabled={!formData.city}
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#C5A059] disabled:opacity-30 appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-[#121212]">Сонгох</option>
                {formData.city && LOCATION_DATA[formData.city].map(dist => (
                  <option key={dist} value={dist} className="bg-[#121212]">{dist}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-widest">Дэлгэрэнгүй хаяг</label>
              <input
                name="address"
                placeholder="Байр, орц, тоот..."
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#C5A059] placeholder:text-white/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-widest">Утасны дугаар</label>
              <input
                name="phone"
                type="tel"
                placeholder="Холбоо барих дугаар"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#C5A059] placeholder:text-white/20 transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => {
              console.log("Final Order Data:", formData);
              onClose();
            }}
            className="mt-2 w-full py-4 bg-[#C5A059] hover:bg-[#d4b476] text-black font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-[#C5A059]/10"
          >
            ХАЯГ БАТАЛГААЖУУЛАХ
          </button>
        </div>
      </motion.div>
    </div>
  );
}