import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      // ✅ Local Laravel dev server
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/storage/**",
      },
      // ✅ Laravel Sail default (add if you use localhost too)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
