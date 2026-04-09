"use client";
import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const suggestions = [
  {
    label: "Шинэ коллекц",
    query: "Шинэ пүүз харуулаач",
    emoji: "👟",
    desc: "Latest Drops",
  },
  {
    label: "Өв соёл",
    query: "Үндэсний хувцас харъя",
    emoji: "👗",
    desc: "Heritage Style",
  },
  {
    label: "Self Care",
    query: "Шилдэг косметик",
    emoji: "💄",
    desc: "Beauty Essentials",
  },
  {
    label: "Трэндүүд",
    query: "Trending одоо юу байна?",
    emoji: "🚀",
    desc: "What's Hot",
  },
];

function PerspectiveMagneticCard({
  label,
  emoji,
  desc,
  onClick,
  index,
}: {
  label: string;
  emoji: string;
  desc: string;
  onClick: () => void;
  index: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 80, damping: 20 });
  const springY = useSpring(y, { stiffness: 80, damping: 20 });

  const rotateX = useTransform(springY, [-100, 100], [12, -12]);
  const rotateY = useTransform(springX, [-100, 100], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  return (
    <div style={{ perspective: "1000px" }} className="w-full">
      <motion.button
        ref={ref}
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 1.2 + index * 0.1, duration: 0.8 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        onClick={onClick}
        style={{
          x: springX,
          y: springY,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="group relative flex flex-col items-start p-4 rounded-xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border-[1.5px] border-blue-400/20 dark:border-blue-500/10 hover:border-blue-500/60 dark:hover:border-blue-400/50 hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] transition-all duration-300 w-full h-[110px]"
      >
        <div
          className="relative z-10 flex flex-col h-full justify-between w-full"
          style={{ transform: "translateZ(30px)" }}
        >
          <span className="text-2xl mb-1 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 origin-left">
            {emoji}
          </span>
          <div>
            <p className="text-[9px] font-bold tracking-[0.15em] text-blue-600/60 dark:text-blue-400/50 uppercase mb-0.5">
              {desc}
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-white/90 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {label}
            </p>
          </div>
        </div>
      </motion.button>
    </div>
  );
}

export function WelcomeSection({
  onSelect,
  userName,
}: {
  onSelect: (q: string) => void;
  userName?: string | null;
}) {
  const firstName = userName ? userName.split(" ")[0] : "Зочин";
  const titleText = `Сайн уу, ${firstName}!`;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[85vh] overflow-hidden px-4">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.04),transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-8 px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-500/10 bg-blue-50/30 dark:bg-blue-500/5 backdrop-blur-md"
        >
          <span className="text-blue-500/70 dark:text-blue-400/40 text-[9px] font-bold tracking-[0.4em] uppercase leading-none block">
            AI Lifestyle Curated
          </span>
        </motion.div>

        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-center leading-[1.1] mb-6">
          {titleText.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{
                opacity: 0,
                filter: "blur(20px)",
                y: 20,
                color: "#FFFFFF",
              }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                y: 0,

                color: i > 7 ? "transparent" : "",
              }}
              transition={{
                delay: 0.1 + i * 0.05,
                duration: 1.2,
                ease: [0.2, 0.65, 0.3, 0.9],
              }}
              className={`inline-block transition-colors duration-1000 ${
                i > 7
                  ? "bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 animate-shimmer bg-[length:200%_auto] italic pr-1"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 1, duration: 1 }}
          className="text-base md:text-lg font-light text-slate-400 dark:text-white/20 tracking-wide text-center mb-16 max-w-lg"
        >
          Таны үнэ цэнийг{" "}
          <span className="text-blue-500/80 italic font-medium">
            үнэ цэнийг
          </span>{" "}
          төгс илэрхийлэх шийдэл энд бий.
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-3xl px-2">
          {suggestions.map((item, i) => (
            <PerspectiveMagneticCard
              key={i}
              {...item}
              onClick={() => onSelect(item.query)}
              index={i}
            />
          ))}
        </div>
      </div>

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
