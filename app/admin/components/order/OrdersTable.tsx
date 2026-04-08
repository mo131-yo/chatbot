"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import React from "react";

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/admin/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Алдаа гарлаа");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  if (loading) return <div className="p-10 text-center text-white">Ачаалж байна...</div>;

  return (
    <div className="p-5 bg-[#121212] rounded-2xl border border-white/10 text-white">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-400 uppercase bg-white/5">
          <tr>
            <th className="px-6 py-4">№</th>
            <th className="px-6 py-4">Хэрэглэгч</th>
            <th className="px-6 py-4">Нийт дүн</th>
            <th className="px-6 py-4">Төлөв</th>
            <th className="px-6 py-4">Бараа</th>
            <th className="px-6 py-4">Үйлдэл</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <tr 
                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" 
                onClick={() => toggleOrder(order.id)}
              >
                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                  {order.id.slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold">{order.customerName || "Зочин"}</span>
                    <span className="text-[10px] text-gray-500">{order.customerPhone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-black text-[#C5A059]">
                  {new Intl.NumberFormat("mn-MN").format(order.totalAmount)}₮
                </td>
                <td className="px-6 py-4 text-[10px]">
                   <span className={`px-2 py-1 rounded-full font-bold ${order.status === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {order.status}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-1 text-gray-400 hover:text-white transition">
                    <Package size={14} />
                    {order.items?.length || 0} бараа
                    {expandedOrderId === order.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </button>
                </td>
                <td className="px-6 py-4 text-[#C5A059] font-bold">Харах</td>
              </tr>

              {expandedOrderId === order.id && (
                <tr className="bg-white/3">
                  <td colSpan={6} className="p-6">
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
                        Захиалгын дэлгэрэнгүй:
                      </h4>
                      
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:border-[#C5A059]/30 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="relative w-14 h-14 bg-gray-800 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center shrink-0">
                                {item.productImage ? (
                                  <img 
                                    src={item.productImage} 
                                    alt={item.productName}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { 
                                      (e.target as HTMLImageElement).src = "/placeholder.png"; 
                                    }}
                                  />
                                ) : (
                                  <Package size={20} className="text-gray-600" />
                                )}
                              </div>
                              <div> 
                              <p className="text-sm font-bold text-gray-100">
                                {item.productName || item.name || "Нэр олдоогүй"}
                              </p>
                                <p className="text-[11px] text-gray-500 font-medium">
                                  {item.quantity} ш × {Number(item.price).toLocaleString()}₮
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-sm text-white">
                                {(item.quantity * item.price).toLocaleString()}₮
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic p-4">Энэ захиалгад барааны мэдээлэл олдсонгүй.</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}