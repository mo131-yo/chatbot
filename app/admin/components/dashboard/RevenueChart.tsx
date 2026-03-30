"use client";

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
  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/10">
      {/* GARCHIG */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Revenue</h2>
        <span className="text-green-400 text-sm">+12.5%</span>
      </div>

      {/* DIAGRAM */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />

          <XAxis dataKey="day" stroke="#aaa" />
          <YAxis stroke="#aaa" />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1b4b",
              border: "none",
              borderRadius: "10px",
              color: "white",
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
