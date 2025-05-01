/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Expor variáveis de ambiente do servidor para as API routes
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  images: {
    loader: 'custom',
    loaderFile: path.resolve(__dirname, 'image-loader.js'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
