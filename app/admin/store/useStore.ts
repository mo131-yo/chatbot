import { create } from "zustand";

// Store-ийн төрлийг тодорхойлно
interface StoreState {
  storeName: string | null;
  isLoading: boolean;
  setStoreName: (name: string) => void;
  setIsLoading: (status: boolean) => void;
}

// Жинхэнэ Store-оо үүсгэх
export const useAppStore = create<StoreState>((set) => ({
  storeName: null,
  isLoading: false,
  setStoreName: (name) => set({ storeName: name }),
  setIsLoading: (status) => set({ isLoading: status }),
}));