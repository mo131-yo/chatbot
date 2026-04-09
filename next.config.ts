import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move serverExternalPackages out of experimental if you are on Next.js 14.2+
  serverExternalPackages: ["@prisma/client", "prisma"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  /* Note: ESLint config is removed from here. 
     To ignore lint errors during builds, 
     use the CLI: 'next build --no-lint' 
  */

  experimental: {
    // If you still see the Turbopack root warning, uncomment the line below:
    // turbopack: { root: "." }
  },
};

export default nextConfig;
