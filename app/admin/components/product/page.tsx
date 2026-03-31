"use client";

import { useState } from "react";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";

export default function Page() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <ProductForm onSuccess={() => setRefresh((p) => p + 1)} />
    </div>
  );
}
