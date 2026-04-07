"use client";

import { useState } from "react";
import ProductTable from "@/app/admin/components/product/ProductTable";
import ProductForm from "@/app/admin/components/product/ProductForm";

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  return (
    <div>
  
      <div className="flex justify-between items-center mb-4 gap-4">
        <h1 className="text-xl font-semibold">Products</h1>

        <ProductForm onSuccess={() => location.reload()} />
      </div>

    
      <div className="mb-4">
        <input
          placeholder="🔍 Бараа хайх..."
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

     
      <ProductTable search={search} />
    </div>
  );
}