import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./chat/cart/frontend/components/CartSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "chat-Store",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="mn" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <CartProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem={true}
              disableTransitionOnChange
            >
              {children}
           
              <CartSidebar />
            </ThemeProvider>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
