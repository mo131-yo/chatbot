"use client";

import RevenueChart from "@/app/admin/components/dashboard/RevenueChart";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-2 gap-6">
      
      <div className="bg-indigo-800 p-5 rounded-xl">
        Products: 120
      </div>

      <div className="bg-indigo-800 p-5 rounded-xl">
        Orders: 45
      </div>

      <div className="col-span-2">
        <RevenueChart />
      </div>

    </div>
  );
}