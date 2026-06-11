import type { NextConfig } from "next";

const isGithubPages = process.env.NEXT_PUBLIC_DEPLOY_TARGET === "gh-pages";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
  ],
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? "/advocacia-gestao" : "",
  assetPrefix: isGithubPages ? "/advocacia-gestao/" : "",
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      react: "./node_modules/react",
      "react-dom": "./node_modules/react-dom",
    },
  },
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
      : "http://127.0.0.1:8000";
    return [
      { source: "/api/:path*",          destination: `${target}/api/:path*` },
      { source: "/posts/anexos/:path*", destination: `${target}/posts/anexos/:path*` },
      { source: "/storage/:path*",      destination: `${target}/storage/:path*` },
      { source: "/sanctum/:path*",      destination: `${target}/sanctum/:path*` },
    ];
  },
};

export default nextConfig;