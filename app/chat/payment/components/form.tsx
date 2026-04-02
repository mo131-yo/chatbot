"use client";

import { motion } from "framer-motion";

interface Props {
  onClose: () => void;
}

export default function LocationForm({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black"
      />

      {/* form box */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative bg-[#121212] border border-white/10 rounded-3xl p-6 w-[90%] max-w-md flex flex-col gap-4 z-10"
      >
        <h2 className="text-xl font-bold text-white">Хүргэлтийн хаяг</h2>

        <input
          placeholder="Хот / Аймаг"
          className="p-3 rounded-lg bg-white/5 border border-white/10 text-white"
        />
        <input
          placeholder="Дүүрэг"
          className="p-3 rounded-lg bg-white/5 border border-white/10 text-white"
        />
        <input
          placeholder="Байр / Тоот"
          className="p-3 rounded-lg bg-white/5 border border-white/10 text-white"
        />
        <input
          placeholder="Утасны дугаар"
          className="p-3 rounded-lg bg-white/5 border border-white/10 text-white"
        />

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 bg-[#C5A059] text-black font-bold rounded-xl"
        >
          Хадгалах
        </button>
      </motion.div>
    </div>
  );
}
