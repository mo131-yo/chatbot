"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState } from "react";

const LocationPicker = dynamic(
  () => import('./LocationPicker'),
  { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-[32px] border border-white/10" /> 
  }
);

interface Props {
  onClose: () => void;
}

const LOCATION_DATA: Record<string, string[]> = {
  "Улаанбаатар": ["Баянгол", "Баянзүрх", "Сонгинохайрхан", "Чингэлтэй", "Хан-Уул", "Сүхбаатар", "Налайх", "Багануур"],
  "Дархан": ["Дархан сум", "Орхон сум", "Шарын гол", "Хонгор"],
  "Эрдэнэт": ["Баян-Өндөр", "Жаргалант"]
};


export default function OrderAddress({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    city: "",
    district: "",
    address: "",
    phone: "",
    lat: 47.9188,
    lng: 106.9176
  });

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
        const cityKey = (addr.city || addr.state || addr.town || "").toLowerCase();
        if (cityKey.includes("ulaanbaatar")) detectedCity = "Улаанбаатар";
        else if (cityKey.includes("darkhan")) detectedCity = "Дархан";
        else if (cityKey.includes("erdenet") || cityKey.includes("orkhon")) detectedCity = "Эрдэнэт";

        let rawDistrict = addr.suburb || addr.district || addr.county || addr.city_district || addr.town || "";
        let detectedDistrict = rawDistrict.replace(/District|Düüreg|дүүрэг|Sum|Сум/gi, "").trim();

        if (detectedCity && LOCATION_DATA[detectedCity]) {
          const match = LOCATION_DATA[detectedCity].find(d => {
            const s1 = d.toLowerCase();
            const s2 = detectedDistrict.toLowerCase();
            return s2.includes(s1) || s1.includes(s2);
          });
          if (match) detectedDistrict = match;
        }

        const detailedAddress = [
          addr.road,
          addr.neighbourhood,
          addr.building,
          addr.house_number
        ].filter(Boolean).join(", ");

        setFormData(prev => ({
          ...prev,
          city: detectedCity || prev.city,
          district: detectedDistrict || prev.district,
          address: detailedAddress || prev.address
        }));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "city") {
      setFormData(prev => ({ ...prev, city: value, district: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[#0F0F0F] border border-white/10 rounded-[40px] overflow-hidden w-full max-w-xl z-10 shadow-2xl"
      >
        <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Хүргэлтийн хаяг</h2>
            <p className="text-sm text-slate-400 mt-1">
              {loading ? "Байршил тогтоож байна..." : "Газрын зураг дээр Pin-ээ тааруулна уу"}
            </p>
          </div>
          {loading && (
            <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="p-8 flex flex-col gap-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          <div className="w-full rounded-[32px] overflow-hidden border border-white/10 shadow-inner">
            <LocationPicker 
              onLocationSelect={handleMapChange} 
              initialPos={[formData.lat, formData.lng]} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Хот / Аймаг</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#C5A059] transition-all cursor-pointer"
              >
                <option value="" disabled className="bg-[#0F0F0F]">Сонгох</option>
                {Object.keys(LOCATION_DATA).map(city => (
                  <option key={city} value={city} className="bg-[#0F0F0F]">{city}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Дүүрэг / Сум</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                disabled={!formData.city}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#C5A059] disabled:opacity-30 transition-all cursor-pointer"
              >
                <option value="" disabled className="bg-[#0F0F0F]">Сонгох</option>
                {formData.city && LOCATION_DATA[formData.city] && (
                  <>
                    {LOCATION_DATA[formData.city].map(dist => (
                      <option key={dist} value={dist} className="bg-[#0F0F0F]">{dist}</option>
                    ))}
                    {formData.district && !LOCATION_DATA[formData.city].includes(formData.district) && (
                      <option value={formData.district} className="bg-[#0F0F0F]">{formData.district}</option>
                    )}
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Дэлгэрэнгүй хаяг (Байр, тоот)</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Жишээ: 45-р байр, 12 тоот"
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#C5A059] placeholder:text-white/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Утасны дугаар</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="8899****"
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#C5A059] placeholder:text-white/20 transition-all"
            />
          </div>

          <button
            onClick={() => {
              if(!formData.phone || !formData.city || !formData.district) return alert("Мэдээллээ гүйцэд бөглөнө үү");
              onClose();
            }}
            className="mt-4 w-full py-5 bg-[#C5A059] hover:bg-[#D4B476] text-black font-black rounded-[20px] active:scale-[0.98] transition-all shadow-xl shadow-[#C5A059]/10 uppercase tracking-wider"
          >
            Хаяг баталгаажуулах
          </button>
        </div>
      </motion.div>
    </div>
  );
}