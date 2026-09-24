import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard", destination: "/home", permanent: false },
      { source: "/create", destination: "/studio/video", permanent: false },
      { source: "/image-gen", destination: "/studio/image", permanent: false },
    ];
  },
};

export default nextConfig;
