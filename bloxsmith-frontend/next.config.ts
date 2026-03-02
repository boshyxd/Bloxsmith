import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE || "",
  },
};

export default nextConfig;
