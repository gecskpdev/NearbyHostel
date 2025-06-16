import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)", // Apply to all routes
  //       headers: [
  //         { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  //         { key: "Cross-Origin-Embedder-Policy", value: "require-corp" }, // Optional, for better security
  //       ],
  //     },
  //   ];
  // },
  eslint: {
    ignoreDuringBuilds: true, 
  },
};

export default nextConfig;
