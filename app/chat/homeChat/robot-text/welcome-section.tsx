"use client";
import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const suggestions = [
  { label: "👟 Шинэ пүүз", query: "Шинэ пүүз харуулаач" },
  { label: "👗 Үндэсний загвар", query: "Үндэсний хувцас харъя" },
  { label: "💄 Гоо сайхан", query: "Шилдэг косметик" },
  { label: "🚀 Трэнд", query: "Trending одоо юу байна?" },
];

function MagneticButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.35);
    y.set((clientY - centerY) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      className="relative px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:border-[#C5A059]/40 hover:bg-white/[0.06] backdrop-blur-xl transition-all duration-300 group overflow-hidden"
    >
      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C5A059]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <span className="relative z-10 text-sm font-medium tracking-wide">
        {children}
      </span>
    </motion.button>
  );
}

export function WelcomeSection({
  onSelect,
  userName,
}: {
  onSelect: (q: string) => void;
  userName?: string | null;
}) {
  const firstName = userName ? userName.split(" ")[0] : "";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden px-4">
      <div className="absolute inset-0 z-0 opacity-40">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#C5A059] rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#0A84FF] rounded-full blur-[100px] mix-blend-screen"
        />
      </div>

      <div className="relative z-10 text-center flex flex-col items-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-6 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <span className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">
            Modern Lifestyle Curated
          </span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-tight">
          <motion.span
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
          >
            Сайн уу,{" "}
          </motion.span>

          {firstName && (
            <motion.span
              initial={{ opacity: 0, filter: "blur(15px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
              className="relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#C5A059] via-[#F3D395] to-[#C5A059] bg-[length:200%_auto] animate-shimmer px-2"
            >
              {firstName}!{}
              <span className="absolute inset-0 blur-3xl bg-[#C5A059]/20 -z-10" />
            </motion.span>
          )}
        </h1>

        <div className="overflow-hidden mb-10">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl font-light text-white/50 tracking-wide"
          >
            Өөрийн хэв маягийг{" "}
            <span className="text-white/80 font-medium">эндээс ол.</span>
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {suggestions.map((item, i) => (
            <MagneticButton key={i} onClick={() => onSelect(item.query)}>
              {item.label}
            </MagneticButton>
          ))}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-10 w-px h-10 bg-gradient-to-b from-white/20 to-transparent"
      />

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .animate-shimmer {
          animation: shimmer 5s linear infinite;
        }
      `}</style>
    </div>
  );
}
