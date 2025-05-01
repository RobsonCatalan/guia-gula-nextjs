/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expor variáveis de ambiente do servidor para as API routes
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
