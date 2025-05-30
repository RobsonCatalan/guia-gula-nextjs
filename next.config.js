/** @type {import('next').NextConfig} */

const nextConfig = {
  // Expor variáveis de ambiente do servidor para as API routes
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  images: {
    loader: 'custom',
    loaderFile: './image-loader.js',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Extend timeout for static page generation (in seconds)
  staticPageGenerationTimeout: 300,
};

module.exports = nextConfig;
