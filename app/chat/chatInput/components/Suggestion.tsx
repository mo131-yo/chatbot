import { motion } from "framer-motion";

export const Suggestions = ({ onSelect, visible }: { onSelect: (q: string) => void; visible: boolean }) => {
  if (!visible) return null;
  const list = [
    { label: "Шинэ номнууд 📚", query: "Шинээр ирсэн ямар гоё номнууд байна?" },
    { label: "Хямд бараа 💰", query: "20,000 төгрөгөөс хямд бараанууд харуул" },
    { label: "Төлбөрийн заавар 💳", query: "Төлбөрөө яаж төлөх вэ? Дансны дугаар өгөөч" },
    { label: "Бэлэгний санаа 🎁", query: "Найздаа бэлэглэх гоё ном санал болгооч" },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-4">
      {list.map((item, idx) => (
        <motion.button
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + idx * 0.1 }}
          onClick={() => onSelect?.(item.query)}
          className="px-4 py-2 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-[#007AFF] dark:hover:border-[#C5A059] text-slate-600 dark:text-slate-300 text-xs md:text-sm rounded-full transition-all shadow-sm"
        >
          {item.label}
        </motion.button>
      ))}
    </div>
  );
};