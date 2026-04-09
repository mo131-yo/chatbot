"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./components/ProductCard";
import { FavoritesDrawer } from "./components/FavortitesDrawer";
import { useCart } from "@/app/context/CartContext";

export default function HorizontalProductStack({
  products = [],
  onSelect = () => {},
  onBuy = () => {},
}: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const lastNavigationTime = useRef(0);
  const { addToCart } = useCart();

  const refreshFavorites = async () => {
    const res = await fetch("/chat/api/favorites");
    if (res.ok) {
      const data = await res.json();
      setFavoriteProducts(data);
      setSavedIds(data.map((f: any) => f.productId));
    }
  };

  useEffect(() => {
    refreshFavorites();
    const handleOpen = () => setIsFavoritesOpen(true);
    window.addEventListener("openFavorites", handleOpen);
    return () => window.removeEventListener("openFavorites", handleOpen);
  }, []);

  const handleSave = useCallback(
    async (product: any) => {
      const id = product.id;
      const isSaving = !savedIds.includes(id);

      const nextCount = isSaving
        ? savedIds.length + 1
        : Math.max(0, savedIds.length - 1);
      window.dispatchEvent(
        new CustomEvent("updateFavoriteCount", {
          detail: { count: nextCount },
        }),
      );

      if (isSaving) {
        setSavedIds((prev) => [...prev, id]);
        setFavoriteProducts((prev) => [
          { productId: id, product: product },
          ...prev,
        ]);
        setIsFavoritesOpen(true);
      } else {
        setSavedIds((prev) => prev.filter((s) => s !== id));
        setFavoriteProducts((prev) => prev.filter((p) => p.productId !== id));
      }

      fetch("/chat/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          name: product.name,
          price: product.price,
          image: product.image,
          storeId: product.storeId,
        }),
      }).catch((e) => {
        console.error("Save failed", e);

        refreshFavorites();

        window.dispatchEvent(
          new CustomEvent("updateFavoriteCount", { detail: {} }),
        );
      });
    },
    [savedIds, favoriteProducts],
  );

  const navigate = useCallback(
    (newDir: number) => {
      const now = Date.now();
      if (now - lastNavigationTime.current < 250) return;
      lastNavigationTime.current = now;
      setCurrentIndex((prev) =>
        newDir > 0
          ? prev === products.length - 1
            ? 0
            : prev + 1
          : prev === 0
            ? products.length - 1
            : prev - 1,
      );
    },
    [products.length],
  );

  const getCardStyle = (index: number) => {
    let diff = index - currentIndex;
    const total = products.length;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    if (diff === 0)
      return { x: 0, scale: 1, opacity: 1, zIndex: 10, rotateY: 0 };
    if (Math.abs(diff) === 1)
      return {
        x:
          diff *
          (typeof window !== "undefined" && window.innerWidth < 768
            ? 140
            : 200),
        scale: 0.85,
        opacity: 0.5,
        zIndex: 5,
        rotateY: diff * -15,
      };
    return { x: diff > 0 ? 500 : -500, scale: 0.5, opacity: 0, zIndex: 0 };
  };

  return (
    <div className="relative flex h-[550px] w-full items-center justify-center overflow-visible select-none">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white"
      >
        <ChevronLeft />
      </button>

      <div
        className="relative flex h-full w-full items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        {products.map((product: any, index: number) => {
          const style = getCardStyle(index);
          const isCurrent = index === currentIndex;
          if (style.opacity === 0 && !isCurrent) return null;
          return (
            <motion.div
              key={`${product.id}-${index}`}
              className="absolute"
              animate={style}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -40) navigate(1);
                else if (info.offset.x > 40) navigate(-1);
              }}
              style={{ zIndex: style.zIndex }}
            >
              <ProductCard
                product={product}
                isCurrent={isCurrent}
                onSelect={() => onSelect(product)}
                onSave={() => handleSave(product)}
                onOrder={() => onBuy(product.name, product.price)}
                onAddToCart={(p: any) => addToCart(p)}
                savedIds={savedIds}
              />
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => navigate(1)}
        className="absolute right-4 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
