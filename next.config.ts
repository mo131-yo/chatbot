import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: any = {
  serverExternalPackages: ["@prisma/client", "prisma"],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', 
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
  }
};

export default nextConfig;