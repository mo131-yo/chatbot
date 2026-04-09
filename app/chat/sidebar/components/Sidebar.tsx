"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatHistory } from "./chat-history";
import { useRouter } from "next/navigation";
import { NewChatBtn } from "./new-chat-btn";
import { Menu, X } from "lucide-react"; // Added for the toggle icon

export default function Sidebar() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // Controls mobile visibility
  const router = useRouter();

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/chat/api/history", {
        cache: "no-store",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRename = async (id: string, title: string) => {
    try {
      const response = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", title }),
      });
      if (response.ok) {
        await fetchHistory();
        router.refresh();
      }
    } catch (error) {
      console.error("Rename error:", error);
    }
  };

  const handlePin = async (id: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pin" }),
      });
      if (res.ok) {
        await fetchHistory();
        router.refresh();
      }
    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchHistory();
        router.refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      {/* 1. MOBILE TOGGLE BUTTON (Visible only on small screens) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/10 md:hidden hover:bg-white/20 transition-all"
        >
          <Menu size={20} />
        </button>
      )}

      {/* 2. BACKGROUND OVERLAY (Dims the chat when sidebar is open on mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[50] flex flex-col h-screen w-72 
          bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-2xl border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0
        `}
      >
        {/* Header inside sidebar to close it on mobile */}
        <div className="p-3 flex items-center justify-between">
          <NewChatBtn
            onClick={() => {
              console.log("New Chat");
              if (window.innerWidth < 768) setIsOpen(false);
            }}
          />

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 md:hidden hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="p-6 text-xs text-slate-500 animate-pulse">
              Уншиж байна...
            </div>
          ) : (
            <ChatHistory
              history={history}
              onSelectChat={(id) => {
                console.log("Selected:", id);
                // Close sidebar after selecting a chat on mobile
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              onPinChat={handlePin}
              onRenameChat={handleRename}
              onDeleteChat={handleDeleteChat}
              onShareChat={() => {}}
            />
          )}
        </div>
      </aside>
    </>
  );
}
