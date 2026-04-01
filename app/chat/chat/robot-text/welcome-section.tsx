"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { TypewriterText } from "@/lib/utils/text/typewriter-text";

const SplineScene = dynamic(
  () => import("@/lib/utils/chat-animation/splite").then((mod) => mod.SplineScene),
  { ssr: false, loading: () => <div className="h-125 w-full bg-white/5 animate-pulse rounded-3xl" /> }
);

const WELCOME_MESSAGES = [
  "Сайн байна уу? Би танд бүх барааг олж өгөхөд туслах ухаалаг туслах байна.",
  "Та яг одоо ямар төрлийн бараа хайж байна вэ?", 
  "Манай дэлгүүрт шинээр ирсэн бараануудыг үзэх үү?",
  "Би танд 24/7 туслахад бэлэн байна. Юу сонирхож байна?",
];

export const WelcomeSection = () => {
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  return (
    <div className="flex-1 relative min-h-125 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, y: [0, -10, 0], scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
        className="absolute top-[12%] right-[8%] md:right-[35%] z-20 bg-white/90 dark:bg-[#161616]/90 backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-2xl max-w-60"
      >
        <p className="text-sm md:text-base font-medium text-slate-800 dark:text-slate-200 leading-snug">
          <TypewriterText 
            text={WELCOME_MESSAGES[currentMsgIndex]} 
            onComplete={() => setCurrentMsgIndex((prev) => (prev + 1) % WELCOME_MESSAGES.length)} 
          />
        </p>
        <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white/90 dark:bg-[#161616]/90 border-r border-b border-slate-200 dark:border-white/10 rotate-45" />
      </motion.div>

      <div className="w-full h-full pt-8">
        <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="w-full h-full" />
        {/* https://prod.spline.design/iK7697Ic6v1C8XbI/scene.splinecode */}
        {/* https://prod.spline.design/OT-uL-mZ-Y7T-9-T/scene.splinecode */}
      </div>
    </div>
  );
};