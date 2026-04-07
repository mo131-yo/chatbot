import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Prisma болон PG-д зориулсан сервер талын багцууд
  serverExternalPackages: ["pg", "@prisma/client", "prisma"],

  // 2. Cloudinary болон бусад гадны домайнаас зураг татах зөвшөөрөл
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Бүх замыг зөвшөөрөх
      },
    ],
  },
  
  // Хэрэв та Turbopack ашиглаж байгаа бол заримдаа хэрэг болдог
  experimental: {
    // serverComponentsExternalPackages: ["@prisma/client"], // Хуучин хувилбарт ингэж бичдэг байсан
  }
};

export default nextConfig;