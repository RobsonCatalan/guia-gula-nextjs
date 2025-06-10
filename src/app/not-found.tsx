import Link from 'next/link';
import CitiesSection from '@/components/CitiesSection';

export const dynamic = 'force-dynamic';
export const prerender = false;

export default function NotFound() {
  return (
    <div className="bg-[#FFF8F0] min-h-screen flex flex-col">
      <header className="bg-[#ECE2D9] text-[#4A4A4A] p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <div role="img" aria-label="Gula.menu" className="logo-mask w-[150px] h-[50px]"></div>
          </Link>
          <nav className="flex space-x-6">
            <Link href="https://www.gulamenu.com.br/" target="_blank" rel="noopener noreferrer" className="!text-[#FF5842] hover:text-[#FFF8F0] transition-colors font-medium">
              Para Restaurantes
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow py-16 px-6 text-center">
        <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">
          Pagina não encontrada<br/>Escolha uma Cidade para começar
        </h1>
        <CitiesSection />
      </main>
    </div>
  );
}
