import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.MAINTENANCE_MODE === "true") {
      return {
        beforeFiles: [
          {
            source: "/((?!maintenance|_next|logos|favicon\\.ico).*)",
            destination: "/maintenance",
          },
        ],
        afterFiles: [],
        fallback: [],
      }
    }
    return { beforeFiles: [], afterFiles: [], fallback: [] }
  },
};

export default nextConfig;
