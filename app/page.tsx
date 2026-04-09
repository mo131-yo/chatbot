"use client";
import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useChatLogic } from "./chat/hooks/useChatLogic";
import { SparklesCore } from "@/lib/utils/chat-animation/sparkles";
import { useScrollEffect } from "./chat/hooks/useScrollEffect";
import { MessageList } from "./chat/homeChat/product/message-list";
import { WelcomeSection } from "./chat/homeChat/robot-text/welcome-section";
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

  // Set default to collapsed (true) so mobile starts clean
  const [isCollapsed, setIsCollapsed] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentChatMessages = activeChatId ? allChats[activeChatId] || [] : [];

  useScrollEffect(messagesEndRef, [currentChatMessages, isTyping]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    /* Change: added min-w-0 and w-full to the main container */
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0D0D0D] overflow-hidden relative">
      <Sidebar
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
        collapsed={isCollapsed}
        history={sidebarHistory || []}
        onNewChat={() => setActiveChatId(null)}
        onSelectChat={(id) => setActiveChatId(id)}
        isLoading={isLoading}
        onDeleteChat={handleDeleteChat}
        activeChatId={activeChatId}
      />

      {/* THE FIX: 
         - flex-1 + w-full forces it to occupy the screen. 
         - min-w-0 stops Flexbox from calculating sidebar space on mobile.
      */}
      <div className="flex-1 flex flex-col w-full min-w-0 h-screen relative z-10 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <div className="absolute inset-0 z-0 pointer-events-none">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={30}
            className="w-full h-full"
          />
        </div>

        <main className="flex-1 overflow-y-auto bg-transparent p-4 relative z-20 custom-scrollbar">
          {currentChatMessages.length === 0 ? (
            <WelcomeSection
              onSelect={(q) => sendMessage(q)}
              userName={isLoaded ? user?.firstName : null}
            />
          ) : (
            <MessageList
              messages={currentChatMessages}
              isTyping={isTyping}
              onProductClick={() => {}}
              onBuy={() => {}}
              messagesEndRef={messagesEndRef}
            />
          )}
        </main>

        <div className="relative z-30">
          <ChatInput
            onSendMessage={sendMessage}
            onVisualResult={addVisualResult}
            history={currentChatMessages}
            isTyping={isTyping || isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
