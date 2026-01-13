import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  pageExtensions: ["js", "jsx", "md", "ts", "tsx"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
