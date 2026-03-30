import Sidebar from "@/app/admin/components/layout/Sidebar";
import Header from "@/app/admin/components/layout/Header";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#0B132B] text-white">
      <Sidebar />
      <main className="flex-1 p-6 bg-bg min-h-screen">
        <Header />
        <Toaster position="top-right" />
        {children}
      </main>
    </div>
  );
}
