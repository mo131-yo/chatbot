"use client";

import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import { LOCATION_DATA } from "./form1";

interface Props {
  onClose: () => void;
}

const LocationPicker = dynamic(
  () => import('./LocationPicker'),
  { 
    ssr: false,
    loading: () => <div className="h-75 w-full bg-white/5 animate-pulse rounded-xl" /> 
  }
);

export default function OrderAddress({ onClose }: Props) {
  const [formData, setFormData] = useState({
    city: "",
    district: "",
    address: "",
    phone: "",
    lat: 47.9188,
    lng: 106.9176,
  });

  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"city" | "district" | null>(null);

  const selectOption = (name: string, value: string) => {
    if (name === "city") {
      setFormData(prev => ({ ...prev, city: value, district: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setOpenDropdown(null);
  };

  const handleMapChange = async (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=mn`,
      );
      const data = await response.json();
      if (data.address) {
        const addr = data.address;
        let detectedCity = "";
        if (addr.city === "Ulaanbaatar" || addr.state === "Ulaanbaatar") detectedCity = "Улаанбаатар";
        else if (addr.city === "Darkhan" || addr.state === "Darkhan-Uul") detectedCity = "ДарханУул";
        else if (addr.city === "Erdenet" || addr.state === "Orkhon") detectedCity = "Орхон";
        
        setFormData(prev => ({
          ...prev,
          city: detectedCity || prev.city,
          district: addr.suburb || addr.district || addr.county || "",
          address: [addr.road, addr.neighbourhood, addr.house_number].filter(Boolean).join(", ") || prev.address,
        }));
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-[#121212] border border-white/10 rounded-[32px] overflow-hidden w-full max-w-lg z-10 shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-white">Хүргэлтийн хаяг тохируулах</h2>
        </div>

        <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="w-full">
            <LocationPicker onLocationSelect={handleMapChange} initialPos={[formData.lat, formData.lng]} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-widest">Хот / Аймаг</label>
              <div 
                onClick={() => setOpenDropdown(openDropdown === "city" ? null : "city")}
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer hover:border-[#C5A059] transition-all flex justify-between items-center"
              >
                <span className={!formData.city ? "text-white/20" : ""}>{formData.city || "Сонгох"}</span>
                <span className={`text-[10px] transition-transform ${openDropdown === "city" ? "rotate-180" : ""}`}>▼</span>
              </div>
              
              <AnimatePresence>
                {openDropdown === "city" && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[105%] left-0 w-full bg-[#1c1c1c] border border-white/10 rounded-xl z-50 max-h-[200px] overflow-y-auto custom-scrollbar shadow-2xl">
                    {Object.keys(LOCATION_DATA).map((city) => (
                      <div key={city} onClick={() => selectOption("city", city)} className="p-3 text-sm text-white hover:bg-[#C5A059] hover:text-black cursor-pointer transition-colors">
                        {city}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-widest">Дүүрэг / Сум</label>
              <div 
                onClick={() => formData.city && setOpenDropdown(openDropdown === "district" ? null : "district")}
                className={`w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white transition-all flex justify-between items-center ${!formData.city ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:border-[#C5A059]"}`}
              >
                <span className={!formData.district ? "text-white/20" : ""}>{formData.district || "Сонгох"}</span>
                <span className={`text-[10px] transition-transform ${openDropdown === "district" ? "rotate-180" : ""}`}>▼</span>
              </div>

              <AnimatePresence>
                {openDropdown === "district" && formData.city && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[105%] left-0 w-full bg-[#1c1c1c] border border-white/10 rounded-xl z-50 max-h-[200px] overflow-y-auto custom-scrollbar shadow-2xl">
                    {LOCATION_DATA[formData.city]?.map((dist, index) => (
                      <div key={`${dist}-${index}`} onClick={() => selectOption("district", dist)} className="p-3 text-sm text-white hover:bg-[#C5A059] hover:text-black cursor-pointer transition-colors">
                        {dist}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <input name="address" placeholder="Байр, орц, тоот..." value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#C5A059]" />
            <input name="phone" type="tel" placeholder="Утасны дугаар" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#C5A059]" />
          </div>

          <button onClick={() => onClose()} disabled={loading} className="w-full py-4 bg-[#C5A059] hover:bg-[#d4b476] disabled:opacity-50 text-black font-bold rounded-2xl transition-all">
            {loading ? "Уншиж байна..." : "ХАЯГ БАТАЛГААЖУУЛАХ"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}