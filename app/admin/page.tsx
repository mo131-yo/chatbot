import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import RevenueChart from "@/app/admin/components/dashboard/RevenueChart";
import PageWrapper from "./components/PageWrapper";
import { prisma } from "@/lib/prisma";


export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/login");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  
  if (user.publicMetadata?.role !== "admin") {
    return redirect("/");
  }
// const index =pinecone.Index("products")
  return (
    <PageWrapper>
      <div className="grid grid-cols-2 gap-6">
        <div
          className="p-5 rounded-xl bg-indigo-800 text-white transition hover:scale-105 hover:shadow-xl duration-300
        dark:bg-indigo-800 dark:text-white"
        >
          <p className="text-sm opacity-70">Products</p>
          <h2 className="text-2xl font-bold">120</h2>
        </div>

        <div
          className="p-5 rounded-xl bg-indigo-800 text-white transition hover:scale-105 hover:shadow-xl duration-300
        dark:bg-indigo-800 dark:text-white"
        >
          <p className="text-sm opacity-70">Orders</p>
          <h2 className="text-2xl font-bold">50</h2>
        </div>

        <div></div>

        <div
          className="col-span-2
        bg-white/5 backdrop-blur-md
        dark:bg-white
        rounded-2xl p-4
        transition-colors duration-300"
        >
          <RevenueChart />
        </div>
      </div>
    </PageWrapper>
  );
}
