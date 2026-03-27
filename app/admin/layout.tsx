import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-indigo-700">
        <Header />
        {children}
      </main>
    </div>
  );
}
