"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  PlusCircle,
} from "lucide-react";
import ProductForm from "../product/ProductForm";
import ProductTable from "../product/ProductTable";
import RevenueChart from "./RevenueChart";
import { useAppStore } from "../../store/useStore";
import OrderTable from "../product/OrderTable";

interface AdminDashboardProps {
  initialStoreName: string | null;
  userId: string; 
}

export default function AdminDashboardContent({ initialStoreName, userId }: AdminDashboardProps) {
  const { storeName, setStoreName, isLoading, setIsLoading } = useAppStore();
  
  const [stats, setStats] = useState({ products: 0, orders: 0 });
  const [orderList, setOrderList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async (name: string) => {
    try {
      const [statsRes, orderRes] = await Promise.all([
        fetch(`/admin/api/dashboard-stats?storeName=${encodeURIComponent(name)}`),
        fetch(`/admin/api/orders?storeName=${encodeURIComponent(name)}`)
      ]);

      const statsData = await statsRes.json();
      const orderData = await orderRes.json();

      if (statsData.success) {
        setStats({ products: statsData.productCount, orders: statsData.orderCount });
      }

      if (Array.isArray(orderData)) {
        setOrderList(orderData);
      } else if (orderData.success) {
        setOrderList(orderData.orders);
      }
    } catch (e) {
      console.error("Data fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  useEffect(() => {
    if (initialStoreName) {
      setStoreName(initialStoreName);
      fetchData(initialStoreName);
    } else {
      fetch("/admin/api/get-store")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.storeName) {
            setStoreName(data.storeName);
            fetchData(data.storeName);
          } else {
            setIsLoading(false);
          }
        })
        .catch(() => setIsLoading(false));
    }
  }, [initialStoreName, setStoreName, fetchData]);

  const handleActionSuccess = () => {
    if (storeName) {
      fetchData(storeName);
      setRefreshKey(prev => prev + 1);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 font-medium italic animate-pulse">Системийг бэлдэж байна...</p>
    </div>
  );

  if (!storeName) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <PlusCircle size={48} className="text-indigo-500/50" />
      <h2 className="text-2xl font-bold text-white">Дэлгүүр олдсонгүй</h2>
      <p className="text-gray-500">Та эхлээд дэлгүүрийн нэрээ тохируулна уу.</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Live Control Center</p>
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">
            {storeName}<span className="text-indigo-500">.</span>
          </h1>
        </div>
        <ProductForm storeName={storeName} onSuccess={handleActionSuccess} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Нийт бараа" 
          value={stats.products} 
          icon={<Package className="text-white/10" size={120} />}
          gradient="from-indigo-600 to-indigo-800"
        />
        <StatCard 
          label="Захиалга" 
          value={stats.orders} 
          icon={<ShoppingBag className="text-white/5" size={120} />}
          bg="bg-[#111111]"
        />
        <StatCard 
          label="Статус" 
          value="ACTIVE" 
          isStatus
          icon={<TrendingUp className="text-emerald-500/10" size={120} />}
          bg="bg-[#111111]"
        />
      </div>

      <div className="space-y-8">
        <div className="flex gap-10 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
          {['products', 'orders'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-2xl font-black transition-all relative pb-2 uppercase ${activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              {tab === 'products' ? 'Бүх бараа' : 'Захиалгууд'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-full" />}
            </button>
          ))}
        </div>

        {activeTab === 'products' ? (
          <ProductTable key={refreshKey} storeName={storeName} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <OrderTable orders={orderList} /> 
            <div className="bg-[#0A0A0A] rounded-[3rem] p-8 border border-white/5">
               <RevenueChart orders={orderList || []} />
            </div>  
            
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, gradient, bg, isStatus }: any) {
  return (
    <div className={`relative overflow-hidden p-8 rounded-[2.5rem] shadow-xl group hover:-translate-y-1 transition-all ${gradient ? `bg-gradient-to-br ${gradient}` : bg} border border-white/5`}>
      <div className="absolute -right-4 -bottom-4 transition-transform group-hover:rotate-6">
        {icon}
      </div>
      <p className={`${gradient ? 'text-indigo-100' : 'text-gray-500'} text-[10px] font-bold uppercase tracking-[0.2em]`}>{label}</p>
      <h2 className={`text-6xl font-black mt-2 tracking-tighter ${isStatus ? 'text-emerald-500 italic text-5xl' : 'text-white'}`}>
        {value}
      </h2>
    </div>
  );
}