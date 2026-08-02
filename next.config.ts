import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow any external image for R2 flexibility
      },
    ],
  },
};

export default nextConfig;
