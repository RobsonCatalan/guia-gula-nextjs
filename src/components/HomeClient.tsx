'use client';

import React, { useState, useEffect, useRef } from 'react';
import CityDetector from '@/components/CityDetector';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CitiesSectionClient from './CitiesSection.client';

// Normalize slug strings (remove accents, spaces → hyphens)
function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface HomeClientProps {
  initialCities: string[];
}

export default function HomeClient({ initialCities }: HomeClientProps) {
  // Cookie utility
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

  // State
  const [selectedCity, setSelectedCity] = useState<string>('sao-paulo');
  const [detected, setDetected] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [noResults, setNoResults] = useState<boolean>(false);

  const cityOptions = initialCities.map(slug => ({
    value: slug,
    label: slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/\bSao\b/g, 'São'),
  }));

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

  const router = useRouter();

  useEffect(() => {
    const cookie = getCookie('selectedCity');
    if (cookie) {
      setSelectedCity(cookie);
      setDetected(true);
    }
    setInitialized(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <header className="bg-[#ECE2D9] text-[#4A4A4A] p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div role="img" aria-label="Gula.menu" className="logo-mask w-[150px] h-[50px]"></div>
          {initialized && <CityDetector onCityDetected={handleCityDetected} />}
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
      </header>
      {/* Barra de busca removida */}
      {/* Restaurantes em destaque removidos */}
      <section className="py-6 mt-0 px-6 bg-[#ECE2D9]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#4A4A4A] mb-6">Selecione sua Cidade</h2>
          <CitiesSectionClient cities={initialCities} />
        </div>
      </section>
      <div className="mt-0 py-6 text-center">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4 font-['Roboto']">Conheça o Gula.menu</h2>
        <p className="text-[#4A4A4A] max-w-3xl mx-auto">
          Descubra restaurantes de diversas culinárias na sua cidade, veja os cardápios, avaliações, horários de funcionamento e disponibilidade de delivery. Se você for proprietário de um restaurante <a href="https://www.gulamenu.com.br/" target="_blank" rel="noopener noreferrer" className="font-medium text-[#FF5842] underline">clique aqui</a>
        </p>
      </div>
    </div>
  );
}
