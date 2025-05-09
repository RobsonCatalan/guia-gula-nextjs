import { Metadata } from 'next';
import Image from 'next/image';
import CategorySection from '@/components/CategorySection';
import Link from 'next/link';
import path from 'path';
import fs from 'fs';
import { Suspense } from 'react';
import CityClientComponent from './client-component';
import CitiesSection from '@/components/CitiesSection';

const normalize = (str: string) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ cidade: string }> }): Promise<Metadata> {
  const { cidade } = await params;
  
  // Formata a cidade para exibição
  const cidadeFormatada = cidade
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');
  
  return {
    title: `Restaurantes em ${cidadeFormatada} | Gula.menu`,
    description: `Descubra os melhores restaurantes em ${cidadeFormatada}. Encontre avaliações, menus e horários.`,
    metadataBase: new URL('http://localhost:3001'),
  };
}

export const revalidate = 3600; // 1h cache no servidor

export default async function Page({ params }: { params: Promise<{ cidade: string }> }) {
  const { cidade } = await params;
  
  // Formata a cidade para exibição
  const cidadeFormatada = cidade
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');
  
  console.log(`Cidade: ${cidadeFormatada}`);
  
  const imgPath = path.join(process.cwd(), 'public', 'images', 'cities', `${cidade}.webp`);
  const hasImage = fs.existsSync(imgPath);
  
  return (
    <div className="bg-[#FFF8F0]">
      <header className="bg-[#ECE2D9] text-[#4A4A4A] p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <div role="img" aria-label="Gula.menu" className="logo-mask w-[150px] h-[50px]"></div>
          </Link>
          <nav className="flex space-x-6">
            <Link href="https://www.gulamenu.com.br/" target="_blank" rel="noopener noreferrer" className="!text-[#FF5842] hover:text-[#FFF8F0] transition-colors font-medium">Para Restaurantes</Link>
          </nav>
        </div>
      </header>
      <nav className="max-w-7xl mx-auto px-6 py-2 text-sm text-[#4A4A4A]" aria-label="breadcrumb">
        <ol className="list-none flex">
          <li>
            <Link href="/" className="hover:underline">Início</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="font-medium">{cidadeFormatada}</li>
        </ol>
      </nav>
      <CategorySection city={cidade} title="" />
      <main id="restaurants" className="max-w-7xl mx-auto px-6 py-6 bg-[#FFF8F0]">
        <h1 className="text-2xl font-bold text-[#4A4A4A] mb-6">
          Todos os Restaurantes em {cidadeFormatada}
        </h1>
        <Suspense fallback={<div>Carregando restaurantes...</div>}>
          <CityClientComponent cidade={cidade} />
        </Suspense>
      </main>
      <section className="py-6 mt-0 px-6 bg-[#ECE2D9]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#4A4A4A] mb-6">Explore outras Cidades</h2>
          <CitiesSection currentCity={cidade} />
        </div>
      </section>
      <div className="mt-0 py-6 text-center">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4 font-['Roboto']">
          Conheça o Gula.menu
        </h2>
        <p className="text-[#4A4A4A] max-w-3xl mx-auto">
          Descubra restaurantes de diversas culinárias na sua cidade, veja os cardápios, avaliações, horários de funcionamento e disponibilidade de delivery. Se você for proprietário de um restaurante <a href="https://www.gulamenu.com.br/" target="_blank" rel="noopener noreferrer" className="font-medium text-[#FF5842] underline">clique aqui</a>
        </p>
      </div>
    </div>
  );
}
