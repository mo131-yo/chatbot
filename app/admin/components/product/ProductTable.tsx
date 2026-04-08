"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, PackageOpen, Trash2, Edit3 } from "lucide-react";
import ProductForm from "./ProductForm";

export default function ProductTable({ search }: { search: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/admin/api/productAllGet", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/admin/api/productDelete?id=${deletingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deletingId));
        setDeletingId(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getProductImage = (p: any): string => {
    const meta = p.metadata || {};
    const imgUrl = meta.product_image_url || p.imageUrl || p.image;

    if (imgUrl) return imgUrl;
    if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];

    return "https://placehold.co";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-gray-400 text-sm animate-pulse">Ачаалж байна...</p>
      </div>
    );
  }

  const filtered = products.filter((p) => {
    const productName = p?.name || "";
    const searchTerm = search || "";

    return productName.toLowerCase().includes(searchTerm.toLowerCase());
  });
  return (
    <div className="relative w-full bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {editingProduct && (
        <ProductForm
          key={editingProduct.id}
          initialData={editingProduct}
          onSuccess={() => {
            setEditingProduct(null);
            fetchData();
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-200 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-2">
              Устгах уу?
            </h3>
            <p className="text-gray-400 text-center text-sm mb-8 leading-relaxed">
              Та энэ барааг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах
              боломжгүй.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-white/5 transition-all"
              >
                Болих
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Устгах"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-900 uppercase text-[10px] font-bold tracking-widest">
              <th className="p-5">Зураг</th>
              <th className="p-5">Барааны нэр</th>
              <th className="p-5">Үнэ</th>
              <th className="p-5">Брэнд</th>
              <th className="p-5">Үлдэгдэл</th>
              <th className="p-5 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-20 text-center text-gray-400 animate-pulse"
                >
                  <PackageOpen className="w-10 h-10 mx-auto mb-2" />
                  <p>Бараа олдсонгүй.</p>
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const meta = p.metadata || {};
                const name = meta.product_name || p.name || "Нэргүй";
                const price = meta.formatted_price || p.price || 0;
                const brand = meta.brand || p.brand || "-";
                const stock = meta.stock || p.stock || 0;

                return (
                  <tr
                    key={p.id}
                    onClick={() => setEditingProduct(p)}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
                        <img
                          src={getProductImage(p)}
                          className="w-full h-full object-cover transition group-hover:scale-110"
                          alt={name}
                        />
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">
                      {name}
                    </td>
                    <td className="p-4 text-indigo-600 dark:text-indigo-400 font-bold font-mono">
                      {new Intl.NumberFormat().format(price)}₮
                    </td>
                    <td className="p-4 text-gray-500">{brand}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          stock > 0
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {stock}
                      </span>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
