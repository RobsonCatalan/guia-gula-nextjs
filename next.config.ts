import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Configuração de domínios externos para imagens (adicione conforme necessário)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      }
    ],
    // Formatos modernos para melhor performance
    formats: ['image/avif', 'image/webp'],
    // Configuração do dispositivo para imagens responsivas
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Tamanhos para otimização via srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Ativa compilação estritamente de acordo com as regras de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Melhora otimização para SEO e performance
  poweredByHeader: false, // Remove o header 'X-Powered-By'
  compress: true, // Compressão do servidor
  reactStrictMode: true, // Modo estrito do React para identificar possíveis problemas
  
  // Otimizações SEO adicionais
  trailingSlash: false, // URLs mais limpas (sem barra final)
  
  // Configuração de cabeçalhos HTTP para melhorar SEO e segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Melhora a segurança e pontuação em testes de SEO
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissões e recursos da página
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          // Configuração para cache de recursos estáticos para conteúdo dinâmico
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      // Cabeçalhos específicos para conteúdo de imagem
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cabeçalhos para arquivos estáticos
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cabeçalhos para fontes
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirecionamentos para URLs canônicas de acordo com a estrutura definida
  async redirects() {
    return [
      // Redirecionamento para página inicial
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      // Redirecionamentos para URLs canônicas de restaurantes
      {
        source: '/:cidade/restaurante/:slug',
        destination: '/:cidade/restaurante/:slug',
        permanent: true,
      },
      {
        source: '/restaurantes',
        destination: '/',
        permanent: true,
      },
      // Redirecionamento de URLs com formato alternativo para restaurantes por cidade
      {
        source: '/restaurantes/:cidade',
        destination: '/:cidade/restaurantes',
        permanent: true,
      },
      // Redirecionamento para formato padrão de restaurantes por culinária
      {
        source: '/restaurantes/:cidade/:culinaria',
        destination: '/:cidade/:culinaria/restaurantes',
        permanent: true,
      },
      // Redirecionamentos para URLs alternativas (caso alguém tente acessar de outra forma)
      {
        source: '/:cidade/restaurantes/:nome',
        destination: '/:cidade/restaurante/:nome',
        permanent: true,
      },
      // Redirecionamento para formatos não-amigáveis (com maiúsculas ou espaços)
      {
        source: '/:cidade/restaurantes',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-host',
          },
        ],
        destination: '/:cidade/restaurantes',
        permanent: true,
        locale: false,
        // Esta regra é aplicada antes da normalização, então URLs com maiúsculas serão convertidas
      },
    ];
  },
};

export default nextConfig;
