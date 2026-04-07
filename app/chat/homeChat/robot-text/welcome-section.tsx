"use client";

import { motion } from "framer-motion";

const suggestions = [
  { label: "👟 Nike гутал харуулаач", query: "Nike гутал харуулаач" },
  { label: "💄 Косметик санал болго", query: "Шилдэг косметик санал болго" },
  { label: "📱 iPhone 15 хэд вэ?", query: "iPhone 15 хэд вэ?" },
  { label: "👗 Трэнд хувцас", query: "Энэ улиралд trending хувцас юу байна?" },
];

const floatingOrbs = [
  { size: 300, x: "10%", y: "20%", color: "#C5A059", delay: 0, duration: 8 },
  { size: 200, x: "75%", y: "10%", color: "#0A84FF", delay: 2, duration: 10 },
  { size: 150, x: "60%", y: "65%", color: "#C5A059", delay: 1, duration: 7 },
  { size: 100, x: "20%", y: "70%", color: "#0A84FF", delay: 3, duration: 9 },
];

export function WelcomeSection({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] overflow-hidden select-none">
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color}18 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-[#C5A059] to-[#8B6F35] flex items-center justify-center shadow-2xl shadow-[#C5A059]/30">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 20C8 13.373 13.373 8 20 8s12 5.373 12 12-5.373 12-12 12S8 26.627 8 20z" fill="white" fillOpacity="0.2"/>
            <path d="M14 20h12M20 14v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="20" cy="20" r="3" fill="white"/>
          </svg>
        </div>
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-[#C5A059]/40"
          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-3"
      >
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
          Сайн байна уу! 👋
        </h1>
        <p className="text-white/50 text-base md:text-lg">
          Юу хайж байна вэ? Би танд тусална.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap gap-2 justify-center mt-6 max-w-lg px-4"
      >
        {suggestions.map((item, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(item.query)}
            className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/70 text-sm backdrop-blur-sm hover:bg-white/10 hover:border-[#C5A059]/40 hover:text-white transition-all shadow-lg"
          >
            {item.label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}