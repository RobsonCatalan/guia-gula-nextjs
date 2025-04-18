'use client';

import Image from "next/image";
import dynamic from 'next/dynamic';

// Importação dinâmica com loading fallback para o componente que usa Firebase
const RestaurantList = dynamic(
  () => import('@/components/RestaurantList'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-6">Restaurantes em Destaque</h2>
        <div className="flex justify-center my-8">
          <div className="w-10 h-10 border-4 border-[#F4A261] border-t-[#D32F2F] rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }
);

import CityDetector from '@/components/CityDetector';
import CategorySection from '@/components/CategorySection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <header className="bg-[#FF5842] text-white p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Image
            src="/images/logo/logo.webp"
            alt="Gula.menu"
            width={150}
            height={50}
            priority
            style={{ width: 'auto', height: 'auto' }}
          />
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Início</a>
            <a href="#" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Cidades</a>
            <a href="#" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Culinárias</a>
            <a href="#" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Sobre</a>
          </nav>
          <button className="md:hidden text-2xl text-white">☰</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-white py-16 bg-gradient-to-b from-[#FF7A68] to-[#FFF8F0]">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-['Roboto']">
            Visite ou Peça dos Melhores Restaurantes
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Encontre os melhores lugares para comer em sua cidade, veja avaliações e menus.
          </p>
          <div className="bg-white rounded-full overflow-hidden flex max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Buscar restaurantes, culinárias..."
              className="flex-grow p-4 text-[#4A4A4A] outline-none"
            />
            <button className="bg-[#F4A261] text-white px-6 py-4 font-bold">
              Buscar
            </button>
          </div>
        </div>
      </section>
      <CityDetector />
      <CategorySection />
      {/* Main Content */}
      <main className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Firestore Integration Demo */}
          <RestaurantList />
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4 font-['Roboto']">
              Conheça o Gula.menu
            </h2>
            <p className="text-[#4A4A4A] max-w-3xl mx-auto">
              Descubra restaurantes de diversas culinárias, veja os cardápios, 
              avaliações e reserve facilmente. Todos os dados são armazenados no Firebase Firestore
              e atualizados em tempo real.
            </p>
          </div>
        </div>
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
              <li><a href="/" className="!text-white hover:!text-[#FFF8F0]">Início</a></li>
              <li><a href="#" className="!text-white hover:!text-[#FFF8F0]">Cidades</a></li>
              <li><a href="#" className="!text-white hover:!text-[#FFF8F0]">Culinárias</a></li>
              <li><a href="#" className="!text-white hover:!text-[#FFF8F0]">Sobre</a></li>
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
