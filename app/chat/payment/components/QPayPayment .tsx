import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QPayPaymentProps {
  amount: number;
  orderId: string;
  onSuccess: (details: any) => void;
  onCancel: () => void;
}

const QPayPayment = ({ amount, orderId, onSuccess, onCancel }: QPayPaymentProps) => {
  const [status, setStatus] = useState<'QR' | 'PROCESSING' | 'SUCCESS'>('QR');
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (status === 'QR' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [status, timeLeft]);

  const handleVerify = async () => {
    setStatus('PROCESSING');
    setTimeout(() => {
      setStatus('SUCCESS');
      onSuccess({
        transactionId: `QPY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount,
        date: new Date().toLocaleString(),
      });
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 0.7 }} 
        exit={{ opacity: 0 }} 
        onClick={onCancel} 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
        className="relative bg-[#121212] border border-white/10 rounded-[32px] overflow-hidden w-full max-w-lg z-10 shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Төлбөр төлөх</h2>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {status === 'QR' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-[2rem] mx-auto w-64 h-64 relative flex items-center justify-center shadow-inner">
                  <div className="w-full h-full bg-black rounded-xl flex items-center justify-center overflow-hidden">
                     <div className="text-white text-[12px] text-center p-4 opacity-30 font-mono break-all leading-relaxed">
                       [ QPay QR Code ]<br/>{orderId}
                     </div>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Төлөх нийт дүн</p>
                  <h2 className="text-4xl font-black text-[#C5A059] font-mono">₮{amount.toLocaleString()}</h2>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Гүйлгээ дуусах хугацаа</span>
                    <span className={timeLeft < 60 ? "text-red-500" : "text-[#C5A059]"}>{formatTime(timeLeft)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / 300) * 100}%` }}
                      className="h-full bg-[#C5A059]"
                    />
                  </div>
                  <button
                    onClick={handleVerify}
                    className="w-full py-4 bg-[#C5A059] hover:bg-[#d4b476] text-black rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95"
                  >
                    ТӨЛБӨР БАТАЛГААЖУУЛАХ
                  </button>
                </div>
              </motion.div>
            )}

            {status === 'PROCESSING' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="py-20 text-center"
              >
                <Loader2 className="w-16 h-16 text-[#C5A059] animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Төлбөр шалгаж байна</h3>
                <p className="text-sm text-slate-500 uppercase tracking-widest">Түр хүлээнэ үү...</p>
              </motion.div>
            )}

            {status === 'SUCCESS' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="py-10">
                  <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Гүйлгээ амжилттай</h3>
                  <p className="text-green-500/80 font-medium">Таны захиалга баталгаажлаа</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Гүйлгээний №</span>
                    <span className="text-white font-mono">{orderId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Огноо</span>
                    <span className="text-white font-mono">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={onCancel}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold border border-white/10 transition-all"
                >
                  ХААХ
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] pt-4">
            <ShieldCheck size={14} /> 
            <span>Secure SSL Encryption</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QPayPayment;