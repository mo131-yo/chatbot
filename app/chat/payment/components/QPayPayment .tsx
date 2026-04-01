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
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-[340px] bg-[#13131a] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
        
        <AnimatePresence mode="wait">
          {status === 'QR' && (
            <motion.div 
              key="qr"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="bg-[#0066ff] text-white text-xs font-bold px-3 py-1 rounded-md">QPay</div>
                <button onClick={onCancel} className="text-[#5c5c72] hover:text-white"><XCircle size={20}/></button>
              </div>

              <div className="bg-white p-4 rounded-2xl mb-6 relative">
                <div className="w-full aspect-square bg-[#000] rounded-lg flex items-center justify-center">
                   <div className="text-white text-[10px] text-center p-4 opacity-50 font-mono">
                     [ SCAN QR TO PAY ]<br/>{orderId}
                   </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-[11px] text-[#5c5c72] uppercase tracking-wider font-bold mb-1">Төлөх дүн</p>
                <h2 className="text-3xl font-bold text-white font-mono">₮{amount.toLocaleString()}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[11px] text-[#5c5c72] font-medium">
                  <span>Хугацаа дуусахад</span>
                  <span className={timeLeft < 60 ? "text-red-500" : ""}>{formatTime(timeLeft)}</span>
                </div>
                <div className="h-1 bg-[#1c1c27] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / 300) * 100}%` }}
                    className="h-full bg-[#6c63ff]"
                  />
                </div>
                <button 
                  onClick={handleVerify}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 transition-all active:scale-95"
                >
                  Төлбөр баталгаажуулах
                </button>
              </div>
            </motion.div>
          )}

          {status === 'PROCESSING' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <Loader2 className="w-12 h-12 text-[#6c63ff] animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Төлбөр шалгаж байна</h3>
              <p className="text-sm text-[#5c5c72]">Түр хүлээнэ үү...</p>
            </motion.div>
          )}

          {status === 'SUCCESS' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="p-8 bg-green-500/10 border-b border-white/5">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Амжилттай!</h3>
                <p className="text-sm text-green-500/80">Төлбөр баталгаажлаа</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5c5c72]">Гүйлгээний №</span>
                  <span className="text-white font-mono text-xs">TRX-992831</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#5c5c72]">Огноо</span>
                  <span className="text-white font-mono text-xs">{new Date().toLocaleDateString()}</span>
                </div>
                <button 
                  onClick={onCancel}
                  className="w-full mt-4 py-3 bg-[#1c1c27] text-white rounded-xl text-sm font-medium hover:bg-[#242432]"
                >
                  Хаах
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 bg-[#1c1c27]/50 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-[#5c5c72]">
          <ShieldCheck size={12} /> SSL Шифрлэлтээр хамгаалагдсан
        </div>
      </div>
    </div>
  );
};

export default QPayPayment;