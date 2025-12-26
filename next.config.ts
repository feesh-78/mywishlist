import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Sites e-commerce - Amazon
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-eu.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-fe.ssl-images-amazon.com',
      },
      // Nike
      {
        protocol: 'https',
        hostname: 'static.nike.com',
      },
      // Fnac
      {
        protocol: 'https',
        hostname: 'static.fnac-static.com',
      },
      // Boulanger
      {
        protocol: 'https',
        hostname: 'media.boulanger.com',
      },
      // Zara
      {
        protocol: 'https',
        hostname: 'static.zara.net',
      },
      // H&M
      {
        protocol: 'https',
        hostname: 'image.hm.com',
      },
      // Sephora
      {
        protocol: 'https',
        hostname: 'www.sephora.fr',
      },
      // Jules
      {
        protocol: 'https',
        hostname: '**.jules.com',
      },
      {
        protocol: 'https',
        hostname: 'media.jules.com',
      },
      // Autres domaines courants
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      // Wildcard pour supporter tous les sites e-commerce
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
