import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['www.sephora.com'],
    // If you have other domains where product images are hosted, add them here
    // For example:
    // domains: ['www.sephora.com', 'images.ulta.com', 'cdn.shopify.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
