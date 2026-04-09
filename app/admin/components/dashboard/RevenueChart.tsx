"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RevenueChart() {
  const [dark, setDark] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/admin/api/orders");
      const orders = await res.json();
      const grouped: Record<string, number> = {};

      orders.forEach((o: any) => {
        const rawDate = o.createdAt || o.date;

        const total = Number(o.total ?? o.totalPrice ?? o.price ?? 0);

        if (!rawDate || isNaN(total)) return;

        const day = new Date(rawDate).toLocaleDateString("en-US", {
          weekday: "short",
        });

        if (!grouped[day]) grouped[day] = 0;

      const chartData = Object.entries(grouped).map(([day, revenue]) => ({
        day,
        revenue,
      }));

      setData(chartData);
    } catch (err) {
      console.error("Revenue fetch error:", err);
    }
  };

  return (
    <div
      className="p-6 rounded-2xl shadow-lg border transition-colors duration-300
      bg-white/5 border-white/10 text-white
      dark:bg-white dark:border-gray-200 dark:text-black"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Revenue</h2>
        <span className="text-green-400 text-sm">Live</span>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={dark ? "#444" : "#ddd"}
          />

          <XAxis dataKey="day" stroke={dark ? "#aaa" : "#555"} />

          <YAxis stroke={dark ? "#aaa" : "#555"} />

          <Tooltip
            contentStyle={{
              backgroundColor: dark ? "#1e1b4b" : "#ffffff",
              border: "none",
              borderRadius: "10px",
              color: dark ? "white" : "black",
            }}
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 4 }}
            isAnimationActive
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
