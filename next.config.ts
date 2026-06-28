import type { NextConfig } from "next";

/**
 * Static export + base path are enabled only when deploying to GitHub Pages
 * (the deploy workflow sets STATIC_EXPORT / NEXT_PUBLIC_BASE_PATH). A normal
 * `npm run build` is unaffected and keeps full server rendering.
 */
const staticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(staticExport ? { output: "export", images: { unoptimized: true } } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  trailingSlash: true,
};

export default nextConfig;
