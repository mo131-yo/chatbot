"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`);
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 5000);
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
    const matchStatus = statusFilter === "all" || o.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div
      className="
      p-5 rounded-2xl
      bg-white/5 text-white
      dark:bg-white dark:text-black
      border border-white/10 dark:border-gray-200
    "
    >
      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search by ID..."
          className="
          p-2 rounded w-full
          bg-gray-800 text-white
          dark:bg-gray-100 dark:text-black
        "
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="
          p-2 rounded
          bg-gray-800 text-white
          dark:bg-gray-100 dark:text-black
        "
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 dark:text-gray-600 text-left border-b border-gray-700 dark:border-gray-200">
              <th className="py-2">ID</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr
                key={o.id}
                className="
                border-b border-gray-700 dark:border-gray-200
                hover:bg-white/5 dark:hover:bg-gray-100 transition
              "
              >
                <td className="py-2 text-xs">{o.id}</td>

                <td className="font-medium">${o.total}</td>

                <td>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium
                      ${
                        o.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : o.status === "paid"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                      }
                    `}
                  >
                    {o.status}
                  </span>
                </td>

                <td>{new Date(o.createdAt).toLocaleDateString()}</td>

                <td className="flex gap-2 py-2">
                  <button
                    onClick={() => updateStatus(o.id, "paid")}
                    className="px-2 py-1 text-xs rounded bg-green-500/80 hover:opacity-80"
                  >
                    Paid
                  </button>

                  <button
                    onClick={() => updateStatus(o.id, "cancelled")}
                    className="px-2 py-1 text-xs rounded bg-red-500/80 hover:opacity-80"
                  >
                    Cancel
                  </button>

                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="px-2 py-1 text-xs rounded bg-indigo-500 hover:opacity-80"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
