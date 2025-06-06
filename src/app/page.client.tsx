'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { RestaurantListProps } from '@/components/RestaurantList';
import CityDetector from '@/components/CityDetector';
import CategorySection from '@/components/CategorySection';
import CitiesSection from '@/components/CitiesSection';

interface HomeClientProps {
  cityOptions: { value: string; label: string }[];
  defaultCity: string;
}

const RestaurantList = dynamic<RestaurantListProps>(
  () => import('@/components/RestaurantList'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-6">Restaurantes em Destaque</h2>
        <div className="flex justify-center my-8">
          <div className="w-10 h-10 border-4 border-[#F4A261] border-t-[#FF5842] rounded-full animate-spin"></div>
        </div>
      </div>
    ),
  }
);

export default function HomeClient({ cityOptions, defaultCity }: HomeClientProps) {
  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const cookie of cookies) {
      const [rawName, ...rest] = cookie.split('=');
      if (rawName.trim() === name) {
        return decodeURIComponent(rest.join('='));
      }
    }
    return null;
  }

  const [selectedCity, setSelectedCity] = useState<string>(defaultCity);
  const [detected, setDetected] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [noResults, setNoResults] = useState<boolean>(false);

  useEffect(() => {
    // Unregister any existing service workers to avoid preload navigation warnings
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => registrations.forEach(r => r.unregister()))
        .catch(err => console.error('Service worker unregister failed:', err));
    }
    const cookie = getCookie('selectedCity');
    if (cookie) {
      setSelectedCity(cookie);
      setDetected(true);
    }
    setInitialized(true);
  }, []);

  const normalize = (str: string) =>
    str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleCityDetected = (cityName: string) => {
    const slug = normalize(cityName);
    setSelectedCity(slug);
    setDetected(true);
    document.cookie = `selectedCity=${slug}; path=/; max-age=2592000`;
  };

  const handleSearch = () => {
    if (!searchQuery) {
      setNoResults(false);
      return;
    }
    const slugTerm = normalize(searchQuery);
    const cards = document.querySelectorAll('[id^="restaurant-"]');
    let found = false;
    for (const card of cards) {
      const el = card as HTMLElement;
      if (el.id.includes(slugTerm)) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        found = true;
        break;
      }
    }
    setNoResults(!found);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <header className="bg-[#ECE2D9] text-[#4A4A4A] p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div role="img" aria-label="Gula.menu" className="logo-mask w-[150px] h-[50px]"></div>
          {initialized && (
            !detected ? (
              <CityDetector onCityDetected={handleCityDetected} />
            ) : cityOptions.length > 0 ? (
              <div className="flex items-baseline space-x-2">
                <select
                  id="city-select"
                  value={selectedCity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCity(val);
                    setDetected(true);
                    document.cookie = `selectedCity=${val}; path=/; max-age=2592000`;
                  }}
                  className="px-4 py-2 border border-[#4A4A4A] rounded bg-white text-[#4A4A4A] focus:outline-none shadow-md"
                >
                  {cityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-[#4A4A4A] px-4 py-2">Carregando cidades...</div>
            )
          )}
          <nav className="hidden md:flex space-x-6">
            <a
              href="https://www.gulamenu.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="!text-[#FF5842] hover:text-[#FFF8F0] transition-colors font-medium"
            >
              Para Restaurantes
            </a>
          </nav>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-2xl text-[#4A4A4A]"
          >
            ☰
          </button>
        </div>
      </header>
      {mobileMenuOpen && (
        <nav className="md:hidden bg-[#ECE2D9] p-4 space-y-2">
          <a
            href="https://www.gulamenu.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="block !text-[#FF5842] hover:!text-[#FFF8F0] transition-colors font-medium"
          >
            Para Restaurantes
          </a>
        </nav>
      )}
      <section className="py-6 bg-[#FFF8F0]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://www.gulamenu.com.br/" }
          ]
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": cityOptions.map((opt, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": opt.label,
            "item": `https://www.gulamenu.com.br/restaurante/${opt.value}`
          }))
        }) }} />
        <div className="max-w-7xl mx-auto text-center px-6">
          <h1 className="text-[#4A4A4A]">
            Os Melhores Restaurantes para Visitar ou Pedir
          </h1>
          <div className="bg-white rounded overflow-hidden flex max-w-xl mx-auto shadow-md">
            <input
              type="text"
              placeholder="Nome do Restaurante..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setNoResults(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-grow px-4 py-2 text-[#4A4A4A] outline-none"
            />
            <button onClick={handleSearch} aria-label="Buscar" className="px-4 py-2 bg-[#FF5842] text-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          {noResults && (
            <p className="text-center text-sm text-red-600 mt-4">
              Nenhum restaurante encontrado para "{searchQuery}"
            </p>
          )}
        </div>
      </section>
      <CategorySection city={selectedCity} title="" />
      <main className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <RestaurantList city={selectedCity} />
        </div>
      </main>
      <section className="py-6 mt-0 px-6 bg-[#ECE2D9]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#4A4A4A] mb-6">Explore outras Cidades</h2>
          <CitiesSection currentCity={selectedCity} />
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
