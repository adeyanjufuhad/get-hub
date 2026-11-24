import path from "node:path";
import type { NextConfig } from "next";

// On Vercel without a configured backend URL yet, skip proxying to localhost so
// /api/v1/* fails fast instead of timing out, allowing client fallbacks to render cleanly.
const rawApiOrigin =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.VERCEL ? "" : "http://localhost:8080");
const apiOrigin = rawApiOrigin.replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(__dirname, ".."),
  outputFileTracingIncludes: {
    "/courses/[slug]/[topicSlug]": ["../content/**/*", "./content/**/*"],
  },
  async rewrites() {
    if (!apiOrigin) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
