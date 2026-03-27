"use client";

import ProductForm from "../components/product/ProductForm";
import ProductTable from "../components/product/ProductTable";


export default function ProductsPage() {
  const refresh = () => {
    window.location.reload();
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
