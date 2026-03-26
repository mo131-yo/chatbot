"use client";

import ProductTable from "@/components/product/ProductTable";
import ProductForm from "@/components/product/ProductForm";

export default function ProductsPage() {
  const refresh = () => {
    window.location.reload(); // simple refresh
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl">Products</h1>
        <ProductForm onSuccess={refresh} />
      </div>

      <ProductTable />
    </div>
  );
}
