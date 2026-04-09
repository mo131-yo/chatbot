"use client";
import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useChatLogic } from "./chat/hooks/useChatLogic";
import { SparklesCore } from "@/lib/utils/chat-animation/sparkles";
import { useScrollEffect } from "./chat/hooks/useScrollEffect";
import { MessageList } from "./chat/homeChat/product/message-list";
import { WelcomeSection } from "./chat/homeChat/robot-text/welcome-section";

import { ProductDetailSidebar } from "./chat/products/detail/ProductDetailSidebar";
import { FavoritesDrawer } from "./chat/products/HorizontalProductStack/components/FavortitesDrawer";
import Sidebar from "./chat/sidebar/page";
import Header from "./chat/header/page";
import ChatInput from "./chat/chatInput/page";

export default function Home() {
  const { user, isLoaded } = useUser();
  const {
    activeChatId,
    setActiveChatId,
    allChats,
    sidebarHistory,
    isTyping,
    sendMessage,
    isLoading,
    addVisualResult,
    isStreaming,
    deleteChat: handleDeleteChat,
  } = useChatLogic();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentChatMessages = activeChatId ? allChats[activeChatId] || [] : [];

  useScrollEffect(messagesEndRef, [currentChatMessages, isTyping]);

  useEffect(() => {
    const handleOpenFavorites = () => setIsFavoritesOpen(true);
    window.addEventListener("openFavorites", handleOpenFavorites);
    return () =>
      window.removeEventListener("openFavorites", handleOpenFavorites);
  }, []);

  const buyProduct = async (productName: string, productPrice?: any) => {
    const exactPrice = Number(productPrice).toLocaleString();
    const userMsg = `Bi яг ${exactPrice}₮ үнэтэй "${productName}"-г авмаар байна. Төлбөрөө яаж төлөх вэ?`;
    await sendMessage(userMsg);
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0D0D0D] transition-colors duration-300 overflow-hidden text-slate-900 dark:text-white relative">
      <ProductDetailSidebar
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuy={(name: string) => buyProduct(name, selectedProduct?.price)}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
      />

      <Sidebar
        toggleSidebar={toggleSidebar}
        collapsed={isCollapsed}
        isCollapsed={isCollapsed}
        history={sidebarHistory || []}
        onNewChat={() => setActiveChatId(null)}
        onSelectChat={(id: string) => setActiveChatId(id)}
        isLoading={isLoading}
        onDeleteChat={handleDeleteChat}
        activeChatId={activeChatId}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <Header toggleSidebar={toggleSidebar} />

        <div className="absolute inset-0 z-0 pointer-events-none">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={30}
            className="w-full h-full"
            particleColor="#C5A059"
          />
        </div>

        <main className="flex-1 overflow-y-auto bg-transparent p-4 custom-scrollbar relative z-10">
          {currentChatMessages.length === 0 ? (
            <WelcomeSection
              onSelect={(q) => sendMessage(q)}
              userName={isLoaded ? user?.firstName : null}
            />
          ) : (
            <MessageList
              messages={currentChatMessages}
              isTyping={isTyping}
              onProductClick={setSelectedProduct}
              onBuy={buyProduct}
              messagesEndRef={messagesEndRef}
            />
          )}
        </main>

        <ChatInput
          onSendMessage={sendMessage}
          onVisualResult={async (userMsg, products) => {
            await addVisualResult(userMsg, products);
          }}
          history={currentChatMessages}
          isTyping={isTyping || isStreaming}
        />
      </div>
    </div>
  );
}
