import { index } from "@/lib/api/pinecone";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboardContent from "./components/dashboard/AdminDashboardContent";
import PageWrapper from "./components/PageWrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return redirect("/login");

  const fetchStore = await index.namespace("orgil").fetch({ 
    ids: [userId] 
  });

  const storeName = fetchStore.records && fetchStore.records[userId] 
    ? (fetchStore.records[userId].metadata?.store_name as string) 
    : null;

  return (
    <PageWrapper>
      <AdminDashboardContent initialStoreName={storeName} userId={userId} />
    </PageWrapper>
  );
}