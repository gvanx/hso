import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "pay.sentoo.io",
      },
      {
        protocol: "https",
        hostname: "pay.sandbox.sentoo.io",
      },
    ],
  },
};

export default nextConfig;
