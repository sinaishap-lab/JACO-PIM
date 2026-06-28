import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The AI product-photo tool sends a base64 image to a Server Action;
    // phone photos exceed the default 1MB body limit.
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
