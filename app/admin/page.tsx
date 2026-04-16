// import { index } from "@/lib/api/pinecone";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import AdminDashboardContent from "./components/dashboard/AdminDashboardContent";
// import PageWrapper from "./components/PageWrapper";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export default async function DashboardPage() {
//   const { userId } = await auth();
//   if (!userId) return redirect("/login");


//   const user = await currentUser();
//   const role = (user?.publicMetadata as any)?.role;
//   if (role !== "admin") return redirect("/chat");

//   const fetchStore = await index.namespace("orgil").fetch({
//     ids: [userId],
//   });

//   const storeName =
//     fetchStore.records && fetchStore.records[userId]
//       ? (fetchStore.records[userId].metadata?.store_name as string)
//       : null;

//   return (
//     <PageWrapper>
//       <AdminDashboardContent initialStoreName={storeName} userId={userId} />
//     </PageWrapper>
//   );
// }





  
import { index } from "@/lib/api/pinecone";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboardContent from "./components/dashboard/AdminDashboardContent";
import PageWrapper from "./components/PageWrapper";
import MagicImporter from "./components/dashboard/MagicImporter";

export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return redirect("/login");

  const user = await currentUser();
  const role = (user?.publicMetadata as any)?.role;
  if (role !== "admin") return redirect("/chat");

  const fetchStore = await index.namespace("orgil").fetch({
    ids: [userId],
  });

  const storeName =
    fetchStore.records && fetchStore.records[userId]
      ? (fetchStore.records[userId].metadata?.store_name as string)
      : null;

  return (
    <PageWrapper>
      <div className="space-y-6">
        {storeName && (
          <div className="mb-8 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 text-sm">AI</span> 
               Барааг бөөнөөр нэмэх
            </h2>
          </div>
        )}

        <AdminDashboardContent initialStoreName={storeName} userId={userId} />
      </div>
    </PageWrapper>
  );
}