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

const data = [
  { day: "Mon", revenue: 200 },
  { day: "Tue", revenue: 400 },
  { day: "Wed", revenue: 300 },
  { day: "Thu", revenue: 600 },
  { day: "Fri", revenue: 800 },
  { day: "Sat", revenue: 500 },
  { day: "Sun", revenue: 900 },
];

export default function RevenueChart() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  return (
    <div
      className="p-6 rounded-2xl shadow-lg border transition-colors duration-300
      bg-white/5 border-white/10 text-white
      dark:bg-white dark:border-gray-200 dark:text-black"
    >
     
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Revenue</h2>
        <span className="text-green-400 text-sm">+12.5%</span>
      </div>

   
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={dark ? "#444" : "#ddd"}
          />

          <XAxis
            dataKey="day"
            stroke={dark ? "#aaa" : "#555"}
          />

          <YAxis
            stroke={dark ? "#aaa" : "#555"}
          />

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
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}