"use client";
import { useState } from "react";
import { Sparkles, Save, Tag, Star, MessageSquare } from "lucide-react";

export default function AITrainingCenter({ storeName }: { storeName: string }) {
  const [trainingData, setTrainingData] = useState({
    promotionText: "",
    couponCode: "",
    priorityProducts: "",
    aiTone: "friendly",
  });

  const handleSave = async () => {
    try {
      const res = await fetch("/admin/api/ai-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...trainingData, storeName }),
      });
      if (res.ok) alert("AI амжилттай суралцлаа! 🧠✨");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-500/20 rounded-2xl">
          <Sparkles className="text-indigo-400 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Training Center</h1>
          <p className="text-gray-400 text-sm">Чатботын зан авир болон онцлох мэдээллийг эндээс удирдана.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
            <Tag size={18} /> <span>Урамшуулал</span>
          </div>
          <textarea 
            className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-32"
            placeholder="Жишээ: Шинэ жил тул бүх пүүз 20% хямдарсан байгааг хэлээрэй."
            value={trainingData.promotionText}
            onChange={(e) => setTrainingData({...trainingData, promotionText: e.target.value})}
          />
          <input 
            className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Купон код: NY2024"
            value={trainingData.couponCode}
            onChange={(e) => setTrainingData({...trainingData, couponCode: e.target.value})}
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center gap-2 text-yellow-400 font-bold mb-2">
            <Star size={18} /> <span>Онцлох бараа</span>
          </div>
          <p className="text-xs text-gray-500 italic">AI эдгээр барааг хэрэглэгчид илүү идэвхтэй санал болгох болно.</p>
          <textarea 
            className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-44"
            placeholder="Жишээ: iPhone 15 Pro, Samsung S24 (Эдгээрийг хамгийн түрүүнд санал болго)"
            value={trainingData.priorityProducts}
            onChange={(e) => setTrainingData({...trainingData, priorityProducts: e.target.value})}
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
            <MessageSquare className="text-gray-400" />
            <select 
              className="bg-black/40 text-white border border-white/10 rounded-xl px-4 py-2 outline-none"
              value={trainingData.aiTone}
              onChange={(e) => setTrainingData({...trainingData, aiTone: e.target.value})}
            >
              <option value="friendly">Найрсаг (Friendly)</option>
              <option value="professional">Мэргэжлийн (Professional)</option>
              <option value="enthusiastic">Эрч хүчтэй (Enthusiastic)</option>
            </select>
        </div>
        
        <button 
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
        >
          <Save size={20} /> AI-г сургах
        </button>
      </div>
    </div>
  );
}