import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.manenbrouw.be",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
