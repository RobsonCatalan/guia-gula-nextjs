import type { Metadata, Viewport } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import FirebaseAppCheckProvider from '@/components/FirebaseAppCheckProvider';
import LayoutFooter from '@/components/LayoutFooter';
import { Suspense } from 'react';
import UnregisterSW from '@/components/UnregisterSW';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Guia de Restaurantes | Gula.menu",
  description: "O seu guia gastronômico para descobrir os melhores restaurantes",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const revalidate = 3600; // 1h cache for all routes

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Gula.menu",
                "url": "https://www.gulamenu.com.br",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://www.gulamenu.com.br/?s={search_term}",
                  "query-input": "required name=search_term"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Gula.menu",
                "url": "https://www.gulamenu.com.br",
                "logo": "https://www.gulamenu.com.br/images/logo/logo.webp"
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Início",
                    "item": "https://www.gulamenu.com.br/"
                  }
                ]
              }
            ])
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} antialiased bg-[#FFF8F0] text-[#4A4A4A]`}
      >
        <FirebaseAppCheckProvider>
          <UnregisterSW />
          {children}
          <Suspense fallback={null}>
            <LayoutFooter />
          </Suspense>
        </FirebaseAppCheckProvider>
      </body>
    </html>
  );
}
