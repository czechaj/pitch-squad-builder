/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const isVercel = !!process.env.VERCEL;

if (isProd && isVercel && !process.env.DATABASE_URL) {
  throw new Error("Missing required env var for Vercel production build: DATABASE_URL");
}

const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
