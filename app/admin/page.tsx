import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Pinecone } from "@pinecone-database/pinecone";
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
 
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(process.env.PINECONE_NAME!);
  const stats = await index.describeIndexStats();
 
  const productCount = stats.namespaces?.[userId]?.recordCount || 0;
 
  const orderCount = (await prisma.order?.count()) || 0;
 
  return (
    <PageWrapper>
      <div className="grid grid-cols-2 gap-6">
        <div
          className="p-5 rounded-xl bg-indigo-800 text-white transition hover:scale-105 hover:shadow-xl duration-300
        dark:bg-indigo-800 dark:text-white"
        >
          <p className="text-sm opacity-70">Products</p>
          <h2 className="text-3xl font-bold">{productCount}</h2>
        </div>
 
        <div
          className="p-5 rounded-xl bg-indigo-800 text-white transition hover:scale-105 hover:shadow-xl duration-300
        dark:bg-indigo-800 dark:text-white"
        >
          <p className="text-sm opacity-70">Orders</p>
          <h2 className="text-3xl font-bold">{orderCount}</h2>
        </div>

        <div className="col-span-2 bg-white/5 backdrop-blur-md dark:bg-white rounded-2xl p-4 transition-colors duration-300">
          <RevenueChart />
        </div>
      </div>
    </PageWrapper>
  );
}
 
 