/** @type {import('next').NextConfig} */

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const nextConfig = {
  // Proxy /api/* → backend so browser never makes cross-origin requests.
  // Works identically in dev (localhost:4000) and prod (Render/Railway URL).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;