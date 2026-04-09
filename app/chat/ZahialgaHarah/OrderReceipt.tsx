"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  XCircle,
  Package,
  Calendar,
  Tag,
  CreditCard,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface OrderReceiptProps {
  orderData: {
    productName: string;
    amount: number;
    orderId: string;
    date: string;
    image?: string; // Барааны зургийн линк
    transactionId?: string;
  };
  onClose: () => void;
}

const OrderReceipt = ({ orderData, onClose }: OrderReceiptProps) => {
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-[#141414] border border-white/10 rounded-[32px] overflow-hidden w-full max-w-md z-10 shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C5A059] rounded-full flex items-center justify-center">
              <Package size={20} className="text-black" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">
              Тасалбар
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-40 h-40 bg-[#1A1A1A] rounded-3xl mb-4 overflow-hidden border border-white/10 shadow-xl flex items-center justify-center">
              {orderData.image ? (
                <img
                  src={orderData.image}
                  alt={orderData.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Tag size={48} className="text-[#C5A059] opacity-50" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white text-center leading-tight">
              {orderData.productName}
            </h3>
            <p className="text-[#C5A059] text-2xl font-black font-mono mt-2">
              {orderData.amount.toLocaleString()}₮
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
              <span className="text-slate-500">Гүйлгээний №</span>
              <span className="text-white font-mono">{orderData.orderId}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
              <span className="text-slate-500">Огноо</span>
              <span className="text-white font-mono">{orderData.date}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest pt-2">
              <span className="text-slate-500">Төлөв</span>
              <span className="text-green-500 flex items-center gap-1">
                <CheckCircle2 size={12} /> Амжилттай
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 py-4 bg-[#C5A059] hover:bg-[#d4b476] text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            ДУУСГАХ <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderReceipt;
