"use client";

import { useEffect, useState } from "react";

export default function ProductTable() {
  const [products, setProducts] = useState<any[]>([]);

  const fetchData = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-left">
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Color</th>
            <th>Size</th>
            <th>Stock</th>
            <th>Description</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr
              key={p.id}
              className="border-b border-gray-700 hover:bg-indigo-900"
            >
              <td>
                <img
                  src={p.images}
                  className="w-12 h-12 object-cover rounded"
                />
              </td>

              <td>{p.name}</td>

              <td>${p.price}</td>

              <td>{p.brand}</td>

              <td>{p.category}</td>

              <td>
                <span className="px-2 py-1 bg-gray-700 rounded">{p.color}</span>
              </td>

              <td>{p.size}</td>

              <td>
                <span
                  className={`px-2 py-1 rounded ${
                    p.stock > 10
                      ? "bg-green-600"
                      : p.stock > 0
                        ? "bg-yellow-500"
                        : "bg-red-600"
                  }`}
                >
                  {p.stock}
                </span>
              </td>

              <td className="max-w-50 truncate">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
