import Sidebar from "@/app/admin/components/layout/Sidebar";
import Header from "@/app/admin/components/layout/Header";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import { StoreProvider } from "./context/StoreContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <StoreProvider>
      <div
        className="flex min-h-screen transition-colors duration-300
        bg-[#0B132B] text-white
        dark:bg-gray-50 dark:text-black"
      >
        <Sidebar />

        <main
          className="flex-1 p-6 min-h-screen transition-colors duration-300
          bg-[#0B132B]
          dark:bg-gray-100"
        >
          <Header />

          <Toaster position="top-right" />

          <div className="mt-4">{children}</div>
        </main>
      </div>
      </StoreProvider>
    </ClerkProvider>
  );
}