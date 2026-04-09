"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface StoreContextType {
  storeName: string | null;
  setStoreName: (name: string) => void;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [storeName, setStoreName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Анх хуудас ачаалагдахад DB-ээс нэрийг нэг удаа татаж авна
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch("/admin/api/get-store"); // Энэ API-г үүсгэх хэрэгтэй
        const data = await res.json();
        if (data.success) setStoreName(data.storeName);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStore();
  }, []);

  return (
    <StoreContext.Provider value={{ storeName, setStoreName, isLoading }}>
      {children}
    </StoreContext.Provider>
  );
}

// Нэрийг дуудаж ашиглах функц (Hook)
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
