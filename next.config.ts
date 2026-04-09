import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "prisma", "@prisma/client"],

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
  
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
  }
};

export default nextConfig;