// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { 
//   Package, 
//   ShoppingBag, 
//   TrendingUp, 
//   PlusCircle,
// } from "lucide-react";
// import ProductForm from "../product/ProductForm";
// import ProductTable from "../product/ProductTable";
// import RevenueChart from "./RevenueChart";
// import { useAppStore } from "../../store/useStore";
// import OrderTable from "../product/OrderTable";

// interface AdminDashboardProps {
//   initialStoreName: string | null;
//   userId: string; 
// }

// export default function AdminDashboardContent({ initialStoreName, userId }: AdminDashboardProps) {
//   const { storeName, setStoreName, isLoading, setIsLoading } = useAppStore();
  
//   const [stats, setStats] = useState({ products: 0, orders: 0 });
//   const [orderList, setOrderList] = useState<any[]>([]);
//   const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
//   const [refreshKey, setRefreshKey] = useState(0);

//   const fetchData = useCallback(async (name: string) => {
//     try {
//       const [statsRes, orderRes] = await Promise.all([
//         fetch(`/admin/api/dashboard-stats?storeName=${encodeURIComponent(name)}`),
//         fetch(`/admin/api/orders?storeName=${encodeURIComponent(name)}`)
//       ]);

//       const statsData = await statsRes.json();
//       const orderData = await orderRes.json();

//       if (statsData.success) {
//         setStats({ products: statsData.productCount, orders: statsData.orderCount });
//       }

//       if (Array.isArray(orderData)) {
//         setOrderList(orderData);
//       } else if (orderData.success) {
//         setOrderList(orderData.orders);
//       }
//     } catch (e) {
//       console.error("Data fetch error:", e);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [setIsLoading]);

//   useEffect(() => {
//     if (initialStoreName) {
//       setStoreName(initialStoreName);
//       fetchData(initialStoreName);
//     } else {
//       fetch("/admin/api/get-store")
//         .then(res => res.json())
//         .then(data => {
//           if (data.success && data.storeName) {
//             setStoreName(data.storeName);
//             fetchData(data.storeName);
//           } else {
//             setIsLoading(false);
//           }
//         })
//         .catch(() => setIsLoading(false));
//     }
//   }, [initialStoreName, setStoreName, fetchData]);

//   const handleActionSuccess = () => {
//     if (storeName) {
//       fetchData(storeName);
//       setRefreshKey(prev => prev + 1);
//     }
//   };

//   if (isLoading) return (
//     <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
//       <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//       <p className="text-gray-400 font-medium italic animate-pulse">Системийг бэлдэж байна...</p>
//     </div>
//   );

//   if (!storeName) return (
//     <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
//       <PlusCircle size={48} className="text-indigo-500/50" />
//       <h2 className="text-2xl font-bold text-white">Дэлгүүр олдсонгүй</h2>
//       <p className="text-gray-500">Та эхлээд дэлгүүрийн нэрээ тохируулна уу.</p>
//     </div>
//   );

//   return (
//     <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//         <div>
//           <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Live Control Center</p>
//           <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">
//             {storeName}<span className="text-indigo-500">.</span>
//           </h1>
//         </div>
//         <ProductForm storeName={storeName} onSuccess={handleActionSuccess} />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <StatCard 
//           label="Нийт бараа" 
//           value={stats.products} 
//           icon={<Package className="text-white/10" size={120} />}
//           gradient="from-indigo-600 to-indigo-800"
//         />
//         <StatCard 
//           label="Захиалга" 
//           value={stats.orders} 
//           icon={<ShoppingBag className="text-white/5" size={120} />}
//           bg="bg-[#111111]"
//         />
//         <StatCard 
//           label="Статус" 
//           value="ACTIVE" 
//           isStatus
//           icon={<TrendingUp className="text-emerald-500/10" size={120} />}
//           bg="bg-[#111111]"
//         />
//       </div>

//       <div className="space-y-8">
//         <div className="flex gap-10 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
//           {['products', 'orders'].map((tab) => (
//             <button 
//               key={tab}
//               onClick={() => setActiveTab(tab as any)}
//               className={`text-2xl font-black transition-all relative pb-2 uppercase ${activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
//             >
//               {tab === 'products' ? 'Бүх бараа' : 'Захиалгууд'}
//               {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-full" />}
//             </button>
//           ))}
//         </div>

//         {activeTab === 'products' ? (
//           <ProductTable key={refreshKey} storeName={storeName} />
//         ) : (
//           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
//             <OrderTable orders={orderList} /> 
//             <div className="bg-[#0A0A0A] rounded-[3rem] p-8 border border-white/5">
//                <RevenueChart orders={orderList || []} />
//             </div>  
            
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function StatCard({ label, value, icon, gradient, bg, isStatus }: any) {
//   return (
//     <div className={`relative overflow-hidden p-8 rounded-[2.5rem] shadow-xl group hover:-translate-y-1 transition-all ${gradient ? `bg-gradient-to-br ${gradient}` : bg} border border-white/5`}>
//       <div className="absolute -right-4 -bottom-4 transition-transform group-hover:rotate-6">
//         {icon}
//       </div>
//       <p className={`${gradient ? 'text-indigo-100' : 'text-gray-500'} text-[10px] font-bold uppercase tracking-[0.2em]`}>{label}</p>
//       <h2 className={`text-6xl font-black mt-2 tracking-tighter ${isStatus ? 'text-emerald-500 italic text-5xl' : 'text-white'}`}>
//         {value}
//       </h2>
//     </div>
//   );
// }






"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "../product/ProductForm";
import RevenueChart from "./RevenueChart";
import { useAppStore } from "../../store/useStore";

export default function AdminDashboardContent({
  initialStoreName,
  userId,
}: {
  initialStoreName: string | null;
  userId: string;
}) {
  const router = useRouter();
  const { storeName, setStoreName, isLoading, setIsLoading } = useAppStore();

  const [tempName, setTempName] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const checkStore = async () => {
      if (initialStoreName) {
        setStoreName(initialStoreName);
        setIsLoading(false);
      } else {
        try {
          const res = await fetch("/admin/api/get-store");
          const data = await res.json();
          if (data.success && data.storeName) {
            setStoreName(data.storeName);
          }
        } catch (e) {
          console.error("Store ачаалахад алдаа гарлаа:", e);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkStore();
  }, [initialStoreName, setStoreName, setIsLoading]);

  // const handleSetupStore = async () => {
  //   if (!tempName.trim()) return;
  //   setIsSettingUp(true);

  //   try {
  //     const res = await fetch("/admin/api/setup-store", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ storeName: tempName.trim() }),
  //     });

  //     if (res.ok) {
  //       setStoreName(tempName.trim());
  //       router.refresh();
  //     } else {
  //       alert("Хадгалахад алдаа гарлаа.");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     alert("Сервертэй холбогдоход алдаа гарлаа.");
  //   } finally {
  //     setIsSettingUp(false);
  //   }
  // };

  const handleSetupStore = async () => {
    if (!tempName.trim()) return;
    setIsSettingUp(true);

    try {
      // 1. Prisma-д Store үүсгэх API руу хандах
      // Энэ API нь баазад дэлгүүрийг чинь бүртгэж, таны userId-тай холбоно
      const res = await fetch("/admin/api/create-store", {
        // Замыг анхаарна уу
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tempName.trim(), // API-д 'name' гэж очих ёстой
          description: "Миний шинэ дэлгүүр", // Шаардлагатай бол
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 2. Фронт-энд дээр storeName-ийг хадгалж, хуудсыг шинэчлэх
        setStoreName(tempName.trim());
        router.refresh();
        // Бараануудаа шууд татаж эхлэх
        fetchProducts();
      } else {
        alert(data.error || "Хадгалахад алдаа гарлаа.");
      }
    } catch (error) {
      console.error(error);
      alert("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const fetchProducts = async () => {
    if (!storeName) return;
    try {
      const res = await fetch(
        `/admin/api/productAllGet?storeName=${encodeURIComponent(storeName)}`,
      );
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (storeName) {
      fetchProducts();
    }
  }, [storeName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!storeName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white transition-colors duration-300 px-4">
        <h1 className="text-3xl italic mb-8 text-center">
          Дэлгүүрийн нэрээ бүртгүүлнэ үү
        </h1>

        <div className="bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 w-full max-w-md shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-widest">
                Дэлгүүрийн нэр
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-gray-500"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Жишээ: High-Tech Store"
              />
            </div>

            <button
              onClick={handleSetupStore}
              disabled={isSettingUp}
              className="w-full bg-indigo-600 py-4 rounded-2xl font-bold text-white hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              {isSettingUp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Хадгалж байна...</span>
                </>
              ) : (
                "Дэлгүүр үүсгэх"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black italic text-white dark:text-black">
            "{storeName}"
          </h1>
        </div>
        <ProductForm
          key={storeName}
          storeName={storeName}
          onSuccess={fetchProducts}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/10">
          <p className="opacity-70 text-sm font-bold uppercase tracking-wider">
            Нийт бараа
          </p>
          <h2 className="text-5xl font-black mt-2">{products.length}</h2>
        </div>
        <div className="p-8 rounded-3xl bg-indigo-600 border border-white/10 text-white">
          <p className="opacity-70 text-sm font-bold uppercase tracking-wider">
            Захиалга
          </p>
          <h2 className="text-5xl font-black mt-2">0</h2>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10">
        <RevenueChart orders={[]} />
      </div>
    </div>
  );
}
