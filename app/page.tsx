"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/SideBar";
import { ChatInput } from "./components/ChatInput";
import ReactMarkdown from "react-markdown";
import React from "react";
import dynamic from "next/dynamic";
import { SparklesCore } from "@/components/ui/sparkles";
import PulsatingDots from "@/components/pulsating-loader";
import { ProductCarousel } from "@/app/components/InfiniteCarousel";
import { ProductDetailSidebar } from "./components/ProductDetailSidebar";
import { AnimatePresence, motion } from "framer-motion";
import { MoveLeft, MoveRight } from "lucide-react";

const SplineScene = dynamic(
  () => import("@/components/ui/splite").then((mod) => mod.SplineScene),
  {
    ssr: false,
    loading: () => (
      <div className="h-125 w-full bg-white/5 animate-pulse rounded-3xl" />
    ),
  },
);

export default function Home() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<
    Record<string, { role: string; content: string }[]>
  >({});
  const [sidebarHistory, setSidebarHistory] = useState<
    { id: string; title: string }[]
  >([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [greeting, setGreeting] = useState("");
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const currentChatMessages = activeChatId ? allChats[activeChatId] || [] : [];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const savedAllChats = localStorage.getItem("ai_all_chats");
    const savedSidebar = localStorage.getItem("ai_sidebar_history");
    if (savedAllChats) setAllChats(JSON.parse(savedAllChats));
    if (savedSidebar) setSidebarHistory(JSON.parse(savedSidebar));
  }, []);

  useEffect(() => {
    if (Object.keys(allChats).length > 0) {
      localStorage.setItem("ai_all_chats", JSON.stringify(allChats));
    }
    localStorage.setItem("ai_sidebar_history", JSON.stringify(sidebarHistory));
  }, [allChats, sidebarHistory]);

  const handleNewMessage = (userMsg: string, aiReply: string) => {
    setIsTyping(false);
    let chatId = activeChatId;

    if (!chatId) {
      chatId = Date.now().toString();
      setActiveChatId(chatId);
      const newEntry = {
        id: chatId,
        title: userMsg.slice(0, 25) + (userMsg.length > 25 ? "..." : ""),
      };
      setSidebarHistory((prev) => [newEntry, ...prev]);
    }

    setAllChats((prev) => ({
      ...prev,
      [chatId!]: [
        ...(prev[chatId!] || []),
        { role: "user", content: userMsg },
        { role: "tuslah", content: aiReply },
      ],
    }));
  };

  const buyProduct = async (
    productName: string,
    productPrice?: string | number,
  ) => {
    const formattedPrice =
      typeof productPrice === "number"
        ? `${productPrice.toLocaleString()}₮`
        : productPrice;

    // const priceInfo = formattedPrice ? `${formattedPrice} үнэтэй ` : "";
    // const userMsg = `Bi ${priceInfo}"${productName}"-г авмаар байна. Төлбөрөө яаж төлж бараагаа захиалах вэ?`;

    const exactPrice = Number(productPrice).toLocaleString();
    const userMsg = `Bi яг ${exactPrice}₮ үнэтэй "${productName}"-г авмаар байна. Төлбөрөө яаж төлөх вэ?`;

    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...currentChatMessages,
            { role: "user", content: userMsg },
          ],
        }),
      });
      const data = await response.json();
      handleNewMessage(userMsg, data.reply);
    } catch (error) {
      setIsTyping(false);
      console.error("Error buying product:", error);
    }
  };

  const scrollMessages = (direction: "left" | "right") => {
    if (messagesContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? messagesContainerRef.current.scrollLeft - scrollAmount
          : messagesContainerRef.current.scrollLeft + scrollAmount;

      messagesContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      setCanScrollLeft(messagesContainerRef.current.scrollLeft > 0);
      setCanScrollRight(
        messagesContainerRef.current.scrollLeft <
          messagesContainerRef.current.scrollWidth -
            messagesContainerRef.current.clientWidth,
      );
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [currentChatMessages]);

  const TypewriterText = ({
    text,
    onComplete,
  }: {
    text: string;
    onComplete?: () => void;
  }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [i, setI] = useState(0);

    useEffect(() => {
      setDisplayedText("");
      setI(0);
    }, [text]);

    useEffect(() => {
      if (i < text.length) {
        const timeout = setTimeout(() => {
          setDisplayedText((prev) => prev + text[i]);
          setI(i + 1);
        }, 30);
        return () => clearTimeout(timeout);
      } else if (i === text.length && onComplete) {
        const waitTimeout = setTimeout(onComplete, 3000);
        return () => clearTimeout(waitTimeout);
      }
    }, [i, text, onComplete]);

    return <span>{displayedText}</span>;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useLayoutEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [currentChatMessages, isTyping]);
  useEffect(() => {
    scrollToBottom();
  }, [currentChatMessages, isTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChatMessages, isTyping]);

  const welcomeMessages = [
    "Сайн байна уу? Би танд бүх барааг олж өгөхөд туслах ухаалаг туслах байна.",
    "Та яг одоо ямар төрлийн бараа хайж байна вэ? ",
    "Манай дэлгүүрт шинээр ирсэн бараануудыг үзэх үү? ",
    "Би танд 24/7 туслахад бэлэн байна. Юу сонирхож байна? ",
  ];

  const handleComplete = () => {
    setCurrentMsgIndex((prev) => (prev + 1) % welcomeMessages.length);
  };
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0D0D0D] transition-colors duration-300 overflow-hidden">
      <ProductDetailSidebar
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuy={(name: string) => buyProduct(name, selectedProduct?.price)}
      />
      <Sidebar
        isCollapsed={isCollapsed}
        history={sidebarHistory}
        onNewChat={() => setActiveChatId(null)}
        onSelectChat={(id) => setActiveChatId(id)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <Header toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

        <div className="absolute inset-0 z-0 pointer-events-none">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={30}
            className="w-full h-full"
            particleColor={
              typeof window !== "undefined" &&
              document.documentElement.classList.contains("dark")
                ? "#0A84FF"
                : "#007AFF"
            }
            speed={1}
          />
        </div>

        <main className="flex-1 overflow-y-auto bg-transparent p-4 custom-scrollbar relative z-10">
          {currentChatMessages.length === 0 ? (
            <div className="flex-1 relative min-h-125 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: [0, -10, 0],
                  scale: 1,
                }}
                transition={{
                  delay: 0.5,
                  duration: 0.8,
                  y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                }}
                className="absolute top-[12%] right-[8%] md:right-[35%] z-20 bg-white/90 dark:bg-[#161616]/90 backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-2xl max-w-60"
              >
                <p className="text-sm md:text-base font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  <TypewriterText
                    text={welcomeMessages[currentMsgIndex]}
                    onComplete={handleComplete}
                  />
                </p>
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white/90 dark:bg-[#161616]/90 border-r border-b border-slate-200 dark:border-white/10 rotate-45"></div>
              </motion.div>

              <div className="w-full h-full pt-8">
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full opacity-90 dark:opacity-100"
                />
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto pb-20 space-y-6">
              {currentChatMessages.map((message, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] shadow-sm px-5 py-3 rounded-[2rem] ${
                      message.role === "user"
                        ? "bg-[#007AFF] dark:bg-[#C5A059] text-white rounded-tr-sm  "
                        : "bg-white dark:bg-[#161616] border border-slate-100 dark:border-white/5 rounded-tl-sm"
                    }`}
                  >
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => {
                            const childrenArray =
                              React.Children.toArray(children);

                            const hasImage = childrenArray.some(
                              (child: any) =>
                                child.type === "img" ||
                                (child.props && child.props.src),
                            );

                            if (hasImage) {
                              const images = childrenArray.filter(
                                (child: any) =>
                                  child.type === "img" ||
                                  (child.props && child.props.src),
                              );
                              const textOnly = childrenArray.filter(
                                (child: any) =>
                                  child.type !== "img" &&
                                  !(child.props && child.props.src),
                              );

                              return (
                                <div className="flex flex-col gap-2 w-full">
                                  {textOnly.length > 0 && (
                                    <div className="mb-2 text-slate-700 dark:text-slate-200 leading-relaxed px-1">
                                      {textOnly}
                                    </div>
                                  )}

                                  <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide snap-x snap-mandatory flex-nowrap w-full">
                                    {images.map((img, i) => (
                                      <div
                                        key={i}
                                        className="shrink-0 snap-center"
                                      >
                                        {img}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-200">
                                {children}
                              </p>
                            );
                          },
                          img: ({ ...props }) => {
                            const [name, price] = (props.alt || "").split(",");

                            const displayPrice = price.toString().includes("₮")
                              ? price
                              : `${Number(price).toLocaleString()}₮`;
                            return (
                              <div
                                onClick={() =>
                                  setSelectedProduct({
                                    name,
                                    price,
                                    image: props.src,
                                  })
                                }
                                className="w-72 bg-white dark:bg-[#1e1e1e] border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-lg mb-4 cursor-pointer transition-all duration-300 hover:shadow-2xl group shrink-0 snap-center"
                              >
                                <div className="h-56 w-full overflow-hidden p-3 pb-0">
                                  <img
                                    {...props}
                                    onLoad={scrollToBottom}
                                    className="w-full h-full object-cover rounded-[1.5rem] transition-transform duration-500 group-hover:scale-105"
                                    alt={name}
                                  />
                                </div>

                                <div className="p-6 pt-4">
                                  <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
                                    {name}
                                  </h3>

                                  <p className="text-[#2563EB] dark:text-[#60A5FA] font-bold text-sm mb-4">
                                    {/* {price.toString().includes('₮') ? price : `${Number(price).toLocaleString()}k`} */}
                                    {displayPrice}
                                  </p>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      buyProduct(name, price);
                                    }}
                                    className="w-full py-3 bg-[#0F172A] dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-[0.95] shadow-md"
                                  >
                                    Buy
                                  </button>
                                </div>
                              </div>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex justify-start items-center gap-3 px-2 py-4"
                  >
                    <div className="bg-white dark:bg-[#161616] ... rounded-xl flex items-center ...">
                      <PulsatingDots />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 ...">Tur huleene uu</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {currentChatMessages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => scrollMessages("left")}
                    disabled={!canScrollLeft}
                    className="p-2 bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all disabled:opacity-20"
                  >
                    <MoveLeft size={20} />
                  </button>
                  <button
                    onClick={() => scrollMessages("right")}
                    disabled={!canScrollRight}
                    className="p-2 bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all disabled:opacity-20"
                  >
                    <MoveRight size={20} />
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} className="h-2 w-full" />
            </div>
          )}
        </main>
        <ChatInput
          onMessageReceived={handleNewMessage}
          history={currentChatMessages}
          setIsTyping={setIsTyping}
        />
      </div>
    </div>
  );
}
