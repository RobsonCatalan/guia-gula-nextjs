// src/app/[cidade]/restaurantes/page.tsx
import { Metadata } from 'next';
import ClientComponent from './client-component';
import Image from 'next/image';
import CategorySection from '@/components/CategorySection';
import Link from 'next/link';

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
  
  // Em vez de buscar os dados no servidor (onde temos problemas de permissão),
  // vamos passar a cidade para o Cliente e deixar que ele busque os dados
  return (
    <div className="bg-[#FFF8F0]">
      <header className="bg-[#FF5842] text-white p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image
              src="/images/logo/logo.webp"
              alt="Gula.menu"
              width={150}
              height={50}
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Início</Link>
            <Link href="#" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Cidades</Link>
            <Link href="#" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Culinárias</Link>
            <Link href="#" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Sobre</Link>
          </nav>
          <button className="md:hidden text-2xl text-white">☰</button>
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
      <section className="text-white py-16 bg-gradient-to-b from-[#FF7A68] to-[#FFF8F0]">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Roboto']">
            Restaurantes em {cidadeFormatada}
          </h1>
          <Image
            src={`/images/cities/${cidade}.webp`}
            alt={`Imagem de ${cidadeFormatada}`}
            width={800}
            height={400}
            className="object-cover w-full h-64 rounded-lg"
            priority
          />
        </div>
      </section>
      <CategorySection city={cidade} />
      <main className="max-w-7xl mx-auto px-6 py-12 bg-[#FFF8F0]">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-6">
          Todos os Restaurantes em {cidadeFormatada}
        </h2>
        <ClientComponent cidade={cidadeFormatada} />
      </main>
      {/* Footer */}
      <footer className="bg-[#FF5842] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Gula.menu</h3>
            <p className="text-sm">
              Seu guia gastronômico completo para encontrar os melhores 
              restaurantes da sua cidade.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="!text-white hover:!text-[#FFF8F0]">Início</Link></li>
              <li><Link href="#" className="!text-white hover:!text-[#FFF8F0]">Cidades</Link></li>
              <li><Link href="#" className="!text-white hover:!text-[#FFF8F0]">Culinárias</Link></li>
              <li><Link href="#" className="!text-white hover:!text-[#FFF8F0]">Sobre</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contato</h3>
            <p className="text-sm">
              contato@gula.menu<br />
              São Paulo, SP - Brasil
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-600 text-center text-sm">
          <span className="text-white">&copy; {new Date().getFullYear()} Gula.menu - Todos os direitos reservados</span>
        </div>
      </footer>
    </div>
  );
}
