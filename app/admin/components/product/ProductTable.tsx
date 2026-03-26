"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export default function ProductTable() {
  const [products, setProducts] = useState<any[]>([]);

  const fetchData = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    fetchData();
  };

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-gray-400">
          <th>Барааны нэр</th>
          <th>Барааны үнэ</th>
          <th>Үйлдлүүд</th>
        </tr>
      </thead>

      <tbody>
        {products.map((p) => (
          <tr key={p.id} className="border-b border-gray-700">
            <td>{p.name}</td>
            <td>{p.price}</td>
            <td className="flex gap-2">
              <Button>Edit</Button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-400"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
