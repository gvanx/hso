import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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

export default withNextIntl(nextConfig);
