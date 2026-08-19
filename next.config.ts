import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    loader: "custom",
    loaderFile: "./imageLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow any external image for R2 flexibility
      },
    ],
  },
};

export default nextConfig;
