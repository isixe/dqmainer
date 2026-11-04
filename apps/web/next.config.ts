import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `core` ships TypeScript sources (no build step), so Next must transpile it.
  transpilePackages: ["core"],
};

export default nextConfig;
