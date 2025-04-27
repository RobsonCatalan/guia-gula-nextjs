'use client';

import { useState } from 'react';
import Image from "next/image";
import dynamic from 'next/dynamic';
import type { RestaurantListProps } from '@/components/RestaurantList';
import CityDetector from '@/components/CityDetector';
import CategorySection from '@/components/CategorySection';
import Link from "next/link";

// Importação dinâmica com loading fallback para o componente que usa Firebase
const RestaurantList = dynamic<RestaurantListProps>(
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

export default function Home() {
  // Selected city and detection flag
  const [selectedCity, setSelectedCity] = useState<string>('sao-paulo');
  const [hasDetected, setHasDetected] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const cityOptions = [
    { value: 'sao-paulo', label: 'São Paulo' },
    { value: 'belo-horizonte', label: 'Belo Horizonte' }
  ];

  // Normalize string to slug (remove accents, spaces → hyphens)
  const normalize = (str: string) =>
    str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

  // Handle callback: override selectedCity and mark detected
  const handleCityDetected = (cityName: string) => {
    const slug = normalize(cityName);
    setSelectedCity(cityOptions.some(opt => opt.value === slug) ? slug : 'sao-paulo');
    setHasDetected(true);
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    const slug = normalize(searchQuery);
    const element = document.getElementById(`restaurant-${slug}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
          {hasDetected ? (
            <div className="flex items-baseline space-x-2">
              <label htmlFor="city-select" className="text-white font-medium hidden md:block">Restaurantes de:</label>
              <select
                id="city-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 border border-white rounded bg-white text-[#4A4A4A] focus:outline-none"
              >
                {cityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <CityDetector onCityDetected={handleCityDetected} />
          )}
          <nav className="hidden md:flex space-x-6">
            <a
              href="https://www.gulamenu.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="!text-white hover:text-[#FFF8F0] transition-colors font-medium"
            >
              Para Restaurantes
            </a>
          </nav>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-2xl text-white"
          >
            ☰
          </button>
        </div>
      </header>
      {mobileMenuOpen && (
        <nav className="md:hidden bg-[#FF5842] p-4 space-y-2">
          <a
            href="https://www.gulamenu.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="block !text-white hover:!text-[#FFF8F0] transition-colors font-medium"
          >
            Para Restaurantes
          </a>
        </nav>
      )}
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
              placeholder="Nome do Restaurante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow p-4 text-[#4A4A4A] outline-none"
            />
            <button onClick={handleSearch} className="bg-[#F4A261] text-white px-6 py-4 font-bold">
              Buscar
            </button>
          </div>
        </div>
      </section>
      <CategorySection city={selectedCity} />
      {/* Main Content */}
      <main className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Firestore Integration Demo */}
          <RestaurantList city={selectedCity} />
          {/* Explore outras Cidades */}
          <section className="mt-16 px-6">
            <h2 className="text-3xl font-bold text-[#4A4A4A] mb-6">Explore outras Cidades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Belo Horizonte */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <Image
                  src="/images/cities/belo-horizonte.webp"
                  alt="Belo Horizonte"
                  width={800}
                  height={500}
                  className="object-cover w-full h-48"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">Belo Horizonte</h3>
                  <p className="text-[#4A4A4A] mb-4">Conhecida pelos tradicionais pratos mineiros e pelos diversos bares e botecos.</p>
                  <div className="flex justify-end mt-2">
                    <Link href="/restaurante/belo-horizonte" className="bg-[#D32F2F] !text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-medium">Ver mais</Link>
                  </div>
                </div>
              </div>
              {/* São Paulo */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <Image
                  src="/images/cities/sao-paulo.webp"
                  alt="São Paulo"
                  width={800}
                  height={500}
                  className="object-cover w-full h-48"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">São Paulo</h3>
                  <p className="text-[#4A4A4A] mb-4">Maior metrópole do Brasil, famosa pela rica diversidade de culinárias e restaurantes renomados.</p>
                  <div className="flex justify-end mt-2">
                    <Link href="/restaurante/sao-paulo" className="bg-[#D32F2F] !text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-medium">Ver mais</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
    </div>
  );
}
