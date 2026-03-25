"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import { useChatLogic } from "./chat/hooks/useChatLogic";
import { SparklesCore } from "@/lib/utils/chat-animation/sparkles";
import { useScrollEffect } from "./chat/hooks/useScrollEffect";
import { MessageList } from "./chat/chat/product/message-list";
import { WelcomeSection } from "./chat/chat/robot-text/welcome-section";
import { ChatInput } from "./chat/input/page";
import { ProductDetailSidebar } from "./chat/products/detail/ProductDetailSidebar";
import { Sidebar } from "./chat/sidebar/page";
import { Header } from "./chat/header/page";

export default function Home() {
  const {
    activeChatId, 
    setActiveChatId, 
    allChats, 
    sidebarHistory,
    isTyping, 
    setIsTyping, 
    sendMessage 
  } = useChatLogic();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChatMessages = activeChatId ? allChats[activeChatId] || [] : [];

  useScrollEffect(messagesEndRef, [currentChatMessages, isTyping]);

  const buyProduct = async (productName: string, productPrice?: any) => {
  const exactPrice = Number(productPrice).toLocaleString();
  const userMsg = `Bi яг ${exactPrice}₮ үнэтэй "${productName}"-г авмаар байна. Төлбөрөө яаж төлөх вэ?`;
  
  await sendMessage(userMsg);
};

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0D0D0D] transition-colors duration-300 overflow-hidden text-slate-900 dark:text-white">
      
      <ProductDetailSidebar
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuy={(name: string) => buyProduct(name, selectedProduct?.price)}
      />

      <Sidebar
        isCollapsed={isCollapsed}
        history={sidebarHistory}
        onNewChat={() => setActiveChatId(null)}
        onSelectChat={(id: string) => setActiveChatId(id)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <Header toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

        <div className="absolute inset-0 z-0 pointer-events-none">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6} maxSize={1.4} particleDensity={30}
            className="w-full h-full"
            particleColor="#0A84FF"
          />
        </div>

        <main className="flex-1 overflow-y-auto bg-transparent p-4 custom-scrollbar relative z-10">
          {currentChatMessages.length === 0 ? (
            <WelcomeSection />
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
          onMessageReceived={sendMessage} 
          history={currentChatMessages}
          setIsTyping={setIsTyping}
        />
      </div>
    </div>
  );
}