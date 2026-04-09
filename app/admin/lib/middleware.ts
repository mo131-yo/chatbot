// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const session = await auth();
    
    // Хэрэв API хүсэлт бөгөөд нэвтрээгүй бол HTML биш JSON буцаах
    if (!session.userId && req.nextUrl.pathname.includes('/api/')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Бусад тохиолдолд (хуудас руу хандах үед) нэвтрэхийг шаардах
    if (!session.userId) {
      return (await auth()).redirectToSignIn();
    }
  }
});