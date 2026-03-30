"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders`
    );
    const data = await res.json();
    setOrders(data);
  };

useEffect(() => {
  fetchData();

  const interval = setInterval(() => {
    fetchData();
  }, 5000);

  return () => clearInterval(interval);
}, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    fetchData();
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.includes(search);
    const matchStatus =
      statusFilter === "all" || o.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* 🔍 SEARCH + FILTER */}
      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search by ID..."
          className="p-2 bg-gray-800 rounded"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 bg-gray-800 rounded"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* TABLE */}
      <table className="w-full">
        <thead>
          <tr className="text-gray-400 text-left">
            <th>ID</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((o) => (
            <tr key={o.id} className="border-b border-gray-700">
              <td>{o.id}</td>
              <td>${o.total}</td>

              <td>
                <span
                  className={`px-2 py-1 rounded ${
                    o.status === "pending"
                      ? "bg-yellow-500"
                      : o.status === "paid"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {o.status}
                </span>
              </td>

              <td>
                {new Date(o.createdAt).toLocaleDateString()}
              </td>

              <td className="flex gap-2">
                <button
                  onClick={() => updateStatus(o.id, "paid")}
                  className="bg-green-500 px-2 rounded"
                >
                  Paid
                </button>

                <button
                  onClick={() => updateStatus(o.id, "cancelled")}
                  className="bg-red-500 px-2 rounded"
                >
                  Cancel
                </button>

                <Link href={`/admin/orders/${o.id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}