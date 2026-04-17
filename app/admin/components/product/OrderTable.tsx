"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Package, ExternalLink, Search, Mail, Phone } from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";

interface OrderTableProps {
  orders: any[];
}

export default function OrderTable({ orders }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    
    const s = searchTerm.toLowerCase();

    return orders.filter((order) => {
      const name = (order.customerName || "").toLowerCase();
      const phone = (order.customerPhone || "").toLowerCase();
      const email = (order.customerEmail || "").toLowerCase();
      const id = (order.id || "").toLowerCase();

      const hasProduct = order.items?.some((item: any) => 
        (item.productName || item.name || "").toLowerCase().includes(s)
      );

      return (
        name.includes(s) || 
        phone.includes(s) || 
        email.includes(s) || 
        id.includes(s) || 
        hasProduct
      );
    });
  }, [searchTerm, orders]);

  const toggleOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500 group-focus-within:text-[#C5A059] transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Захиалгын ID, нэр, утас, и-мэйл эсвэл барааны нэрээр хайх..."
          className="w-full bg-white/[0.03] border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-white outline-none focus:border-[#C5A059]/40 focus:bg-white/[0.05] transition-all placeholder:text-gray-600 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-2 items-center">
            <div className="text-[10px] font-black text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 rounded-full uppercase tracking-widest">
              {filteredOrders.length} илэрц
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#0D0D0D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/[0.03] text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">
            <tr>
              <th className="px-8 py-6">Захиалга</th>
              <th className="px-8 py-6">Хэрэглэгч</th>
              <th className="px-8 py-6">Нийт дүн</th>
              <th className="px-8 py-6">Төлөв</th>
              <th className="px-8 py-6 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr 
                    className="hover:bg-white/[0.04] transition-all cursor-pointer group"
                    onClick={() => toggleOrder(order.id)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[#C5A059] font-bold text-xs uppercase">
                          #{order.id.slice(-6)}
                        </span>
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-white font-bold group-hover:text-[#C5A059] transition-colors">
                          {order.customerName || "Зочин"}
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Phone size={10} /> {order.customerPhone}
                          </span>
                          {order.customerEmail && (
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Mail size={10} /> {order.customerEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-white italic">
                      {new Intl.NumberFormat("mn-MN").format(order.totalAmount)}₮
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'PAID' 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          setSelectedOrder(order); 
                        }}
                        className="bg-white/5 hover:bg-[#C5A059] text-white hover:text-black p-3.5 rounded-2xl transition-all active:scale-95"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>

                  {expandedOrderId === order.id && (
                    <tr className="bg-[#C5A059]/[0.02] animate-in fade-in slide-in-from-top-2 duration-300">
                      <td colSpan={5} className="px-8 py-10 border-l-2 border-[#C5A059]/30">
                        <div className="flex flex-col gap-6">
                          <div className="flex justify-between items-end">
                            <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em]">Захиалгын агуулга</p>
                            <span className="text-[10px] text-gray-400">Нийт {order.items?.length || 0} төрлийн бараа</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.items?.map((item: any, idx: number) => {
                              const isMatch = searchTerm && (item.productName || item.name || "").toLowerCase().includes(searchTerm.toLowerCase());
                              
                              return (
                                <div key={idx} className={`flex justify-between items-center p-5 rounded-3xl border transition-all ${
                                  isMatch ? 'bg-[#C5A059]/10 border-[#C5A059]/30' : 'bg-white/5 border-white/5'
                                }`}>
                                  <div className="flex flex-col gap-1">
                                    <span className={`font-bold ${isMatch ? 'text-[#C5A059]' : 'text-gray-200'}`}>
                                      {item.productName || item.name}
                                    </span>
                                    <span className="text-gray-500 text-[10px] font-black uppercase">Тоо: {item.quantity} ш</span>
                                  </div>
                                  <span className="font-black text-white italic">{Number(item.price * item.quantity).toLocaleString()}₮</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-32 text-center text-gray-600">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-8 bg-white/5 rounded-full ring-1 ring-white/10">
                      <Search size={48} className="opacity-20 text-[#C5A059]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-bold text-lg">Илэрц олдсонгүй</p>
                      <p className="text-sm opacity-50 max-w-xs mx-auto">
                        "{searchTerm}" утгатай таарах захиалга, хэрэглэгч эсвэл бараа олдсонгүй.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}