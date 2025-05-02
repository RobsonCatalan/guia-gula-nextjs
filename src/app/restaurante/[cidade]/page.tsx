import { Metadata } from 'next';
import ClientComponent from './client-component';
import Image from 'next/image';
import CategorySection from '@/components/CategorySection';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

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
    description: `Descubra os melhores restaurantes em ${cidadeFormatada}. Encontre avaliações, menus e faça reservas.`,
    metadataBase: new URL('http://localhost:3001'),
  };
}

export async function generateStaticParams() {
  return [
    { cidade: 'belo-horizonte' },
    { cidade: 'sao-paulo' }
  ];
}

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
      <main id="restaurants" className="max-w-7xl mx-auto px-6 py-12 bg-[#FFF8F0]">
        <h1 className="text-2xl font-bold text-[#4A4A4A] mb-6">
          Todos os Restaurantes em {cidadeFormatada}
        </h1>
        <ClientComponent cidade={cidadeFormatada} />
      </main>
    </div>
  );
}
