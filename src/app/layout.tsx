import type { Metadata, Viewport } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import FirebaseAppCheckProvider from '@/components/FirebaseAppCheckProvider';

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
  title: "Gula.menu | Guia Gastronômico",
  description: "O seu guia gastronômico para descobrir os melhores restaurantes",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} antialiased bg-[#FFF8F0] text-[#4A4A4A]`}
      >
        <FirebaseAppCheckProvider>
          {children}
        </FirebaseAppCheckProvider>
      </body>
    </html>
  );
}
