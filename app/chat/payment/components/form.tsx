"use client";

import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { LOCATION_DATA } from "./form1";

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

type FormData = {
  city: string;
  district: string;
  street: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
};

export default function OrderAddress({ onClose, onConfirm }: Props) {
  const [formData, setFormData] = useState({
    city: "",
    district: "",
    street:"",
    address: "",
    phone: "",
    lat: 47.9188,
    lng: 106.9176,
  });

export default function OrderAddress({ onClose }: Props) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"city" | "district" | null>(
    null,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof Omit<FormData, "lat" | "lng">, boolean>>
  >({});

  const districtOptions = useMemo(() => {
    return formData.city ? (LOCATION_DATA[formData.city] ?? []) : [];
  }, [formData.city]);

  const validateField = (
    name: keyof Omit<FormData, "lat" | "lng">,
    value: string,
    currentData: FormData,
  ): string => {
    const trimmedValue = value.trim();

    switch (name) {
      case "city":
        if (!trimmedValue) return "Хот / аймаг сонгоно уу.";
        return "";

      case "district":
        if (!trimmedValue) return "Дүүрэг / сум сонгоно уу.";
        return "";

      case "street":
        if (!trimmedValue) return "Гудамжийн мэдээллээ оруулна уу.";
        if (trimmedValue.length < 3)
          return "Гудамжийн мэдээлэл хэт богино байна.";
        return "";

      case "address":
        if (!trimmedValue) return "Байр, орц, тоот мэдээллээ оруулна уу.";
        if (trimmedValue.length < 2)
          return "Дэлгэрэнгүй хаяг хэт богино байна.";
        return "";

      case "phone":
        if (!trimmedValue) return "Утасны дугаараа оруулна уу.";
        if (!/^\d+$/.test(trimmedValue))
          return "Утасны дугаар зөвхөн тоо байх ёстой.";
        if (trimmedValue.length !== 8)
          return "Утасны дугаар яг 8 оронтой байх ёстой.";
        return "";

      default:
        return "";
    }
  };

  const validateForm = (data: FormData): FormErrors => {
    const nextErrors: FormErrors = {};

    (["city", "district", "street", "address", "phone"] as const).forEach(
      (field) => {
        const message = validateField(field, data[field], data);
        if (message) {
          nextErrors[field] = message;
        }
      },
    );

    return nextErrors;
  };

  const markAllTouched = () => {
    setTouched({
      city: true,
      district: true,
      street: true,
      address: true,
      phone: true,
    });
  };

  const setFieldValue = (
    name: keyof Omit<FormData, "lat" | "lng">,
    value: string,
  ) => {
    setFormData((prev) => {
      const nextData =
        name === "city"
          ? { ...prev, city: value, district: "" }
          : { ...prev, [name]: value };

      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };

        const currentFieldError = validateField(name, nextData[name], nextData);
        if (currentFieldError) nextErrors[name] = currentFieldError;
        else delete nextErrors[name];

        if (name === "city") {
          const districtError = validateField(
            "district",
            nextData.district,
            nextData,
          );
          if (districtError) nextErrors.district = districtError;
          else delete nextErrors.district;
        }

        return nextErrors;
      });

      return nextData;
    });
  };

  const handleBlur = (name: keyof Omit<FormData, "lat" | "lng">) => {
    setTouched((prev) => ({ ...prev, [name]: true }));

    setErrors((prev) => {
      const next = { ...prev };
      const message = validateField(name, formData[name], formData);

      if (message) next[name] = message;
      else delete next[name];

      return next;
    });
  };

  const handlePhoneChange = (rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 8);
    setFieldValue("phone", digitsOnly);
  };

  const selectOption = (name: "city" | "district", value: string) => {
    setFieldValue(name, value);
    setTouched((prev) => ({
      ...prev,
      [name]: true,
      ...(name === "city" ? { district: true } : {}),
    }));
    setOpenDropdown(null);
  };

  const handleMapChange = async (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    setLoading(true);

    try {
      const response = await fetch(
        `/chat/api/reverse-geocode?lat=${lat}&lng=${lng}`,
      );

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        console.error("reverse geocode api error:", err);

        if (response.status === 429) {
          return;
        }

        throw new Error(err?.error || `API алдаа: ${response.status}`);
      }

      const data = await response.json();

      if (data.address) {
        const addr = data.address;
        let detectedCity = "";

        if (addr.city === "Ulaanbaatar" || addr.state === "Ulaanbaatar") {
          detectedCity = "Улаанбаатар";
        } else if (addr.city === "Darkhan" || addr.state === "Darkhan-Uul") {
          detectedCity = "ДарханУул";
        } else if (addr.city === "Erdenet" || addr.state === "Orkhon") {
          detectedCity = "Орхон";
        }

        const rawDistrict =
          addr.city_district ||
          addr.district ||
          addr.county ||
          addr.suburb ||
          "";

        const normalizedDistrict = rawDistrict
          .replace(" дүүрэг", "")
          .replace(" сум", "")
          .trim();

        setFormData((prev) => {
          const nextData = {
            ...prev,
            city: detectedCity || prev.city,
            district: normalizedDistrict || prev.district,
            address:
              [addr.road, addr.suburb, addr.historic, addr.house_number]
                .filter(Boolean)
                .join(", ") || prev.address,
          };

          setErrors((prevErrors) => {
            const nextErrors = { ...prevErrors };

            (["city", "district", "address"] as const).forEach((field) => {
              const message = validateField(field, nextData[field], nextData);
              if (message) nextErrors[field] = message;
              else delete nextErrors[field];
            });

            return nextErrors;
          });

          return nextData;
        });
      }
    } catch (error) {
      console.error("handleMapChange error:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Хаягийн мэдээлэл авах үед алдаа гарлаа");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    markAllTouched();

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        city: formData.city.trim(),
        district: formData.district.trim(),
        street: formData.street.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        lat: formData.lat,
        lng: formData.lng,
      };

      console.log("Final Order Data:", payload);

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldClassName = (field: keyof FormErrors) => {
    const hasError = touched[field] && errors[field];

    return `w-full rounded-xl border p-3.5 text-white outline-none transition-all ${
      hasError
        ? "border-red-500 bg-red-500/5 focus:border-red-500"
        : "border-white/10 bg-white/5 focus:border-[#C5A059]"
    }`;
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
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[#121212] shadow-2xl"
      >
        <div className="border-b border-white/5 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white">
            Хүргэлтийн хаяг тохируулах
          </h2>
        </div>

        <div className="custom-scrollbar flex max-h-[80vh] flex-col gap-5 overflow-y-auto p-6">
          <div className="w-full">
            <LocationPicker
              onLocationSelect={handleMapChange}
              initialPos={[formData.lat, formData.lng]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative flex flex-col gap-1.5">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Хот / Аймаг
              </label>

              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === "city" ? null : "city")
                }
                onBlur={() => handleBlur("city")}
                className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-white transition-all ${
                  touched.city && errors.city
                    ? "border-red-500 bg-red-500/5"
                    : "border-white/10 bg-white/5 hover:border-[#C5A059]"
                }`}
              >
                <span className={!formData.city ? "text-white/20" : ""}>
                  {formData.city || "Сонгох"}
                </span>
                <span
                  className={`text-[10px] transition-transform ${
                    openDropdown === "city" ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {touched.city && errors.city && (
                <p className="px-1 text-xs text-red-400">{errors.city}</p>
              )}

              <AnimatePresence>
                {openDropdown === "city" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="custom-scrollbar absolute left-0 top-[105%] z-50 max-h-[200px] w-full overflow-y-auto rounded-xl border border-white/10 bg-[#1c1c1c] shadow-2xl"
                  >
                    {Object.keys(LOCATION_DATA).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => selectOption("city", city)}
                        className="w-full p-3 text-left text-sm text-white transition-colors hover:bg-[#C5A059] hover:text-black"
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex flex-col gap-1.5">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Дүүрэг / Сум
              </label>

              <button
                type="button"
                onClick={() =>
                  formData.city &&
                  setOpenDropdown(
                    openDropdown === "district" ? null : "district",
                  )
                }
                onBlur={() => handleBlur("district")}
                className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-white transition-all ${
                  touched.district && errors.district
                    ? "border-red-500 bg-red-500/5"
                    : !formData.city
                      ? "cursor-not-allowed border-white/10 bg-white/5 opacity-30"
                      : "cursor-pointer border-white/10 bg-white/5 hover:border-[#C5A059]"
                }`}
              >
                <span className={!formData.district ? "text-white/20" : ""}>
                  {formData.district || "Сонгох"}
                </span>
                <span
                  className={`text-[10px] transition-transform ${
                    openDropdown === "district" ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {touched.district && errors.district && (
                <p className="px-1 text-xs text-red-400">{errors.district}</p>
              )}

              <AnimatePresence>
                {openDropdown === "district" && formData.city && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="custom-scrollbar absolute left-0 top-[105%] z-50 max-h-[200px] w-full overflow-y-auto rounded-xl border border-white/10 bg-[#1c1c1c] shadow-2xl"
                  >
                    {districtOptions.map((dist, index) => (
                      <button
                        key={`${dist}-${index}`}
                        type="button"
                        onClick={() => selectOption("district", dist)}
                        className="w-full p-3 text-left text-sm text-white transition-colors hover:bg-[#C5A059] hover:text-black"
                      >
                        {dist}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Гудамж
              </label>
              <input
                name="street"
                placeholder="Гудамж.."
                value={formData.street}
                onChange={(e) => setFieldValue("street", e.target.value)}
                onBlur={() => handleBlur("street")}
                className={getFieldClassName("street")}
              />
              {touched.street && errors.street && (
                <p className="px-1 text-xs text-red-400">{errors.street}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Байр / Орц / Тоот
              </label>
              <input
                name="address"
                placeholder="Байр, Орц, Тоот.."
                value={formData.address}
                onChange={(e) => setFieldValue("address", e.target.value)}
                onBlur={() => handleBlur("address")}
                className={getFieldClassName("address")}
              />
              {touched.address && errors.address && (
                <p className="px-1 text-xs text-red-400">{errors.address}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Утасны дугаар
              </label>
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={8}
                placeholder="Утасны дугаар"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleBlur("phone")}
                className={getFieldClassName("phone")}
              />
              {touched.phone && errors.phone && (
                <p className="px-1 text-xs text-red-400">{errors.phone}</p>
              )}
            </div>
          </div>

          <button 
            onClick={() => onConfirm()}
            disabled={loading} 
            className="w-full py-4 bg-[#C5A059] hover:bg-[#d4b476] text-black font-bold rounded-2xl transition-all"
          >
            {loading ? "Уншиж байна..." : "ХАЯГ БАТАЛГААЖУУЛАХ"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
