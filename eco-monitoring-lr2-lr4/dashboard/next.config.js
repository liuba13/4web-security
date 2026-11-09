/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { API_BASE: process.env.API_BASE || "http://localhost:3000" },
};
export default nextConfig;
