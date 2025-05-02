'use client';

import React, { useState, useEffect, useRef } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import { useAppCheckContext } from '@/components/FirebaseAppCheckProvider';
import Link from 'next/link';
import Image from 'next/image';
import { getRestaurantsByCity } from '@/lib/restaurantService';

const slugify = (str: string) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

// Formata slug de cidade para exibição
const formatSlug = (slug: string) =>
  slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');

interface CategorySectionProps {
  city: string;
  title?: string;
  currentCategory?: string;
}

const categoryMap: Record<string, string> = {
  barPub: 'Bar & Pub',
  pizza: 'Pizzaria',
  cafeBakeryDesserts: 'Café & Pães & Doces',
  snacksBurgers: 'Lanches & Burgers',
  barbecueGrill: 'Churrasco & Grelhados',
  pastryShop: 'Pastelaria',
  japanese: 'Japonês',
  italian: 'Italiano',
  mineiro: 'Mineiro',
  arabic: 'Árabe',
  selfServiceBuffet: 'Self-service & Buffet',
  seafood: 'Frutos do Mar',
  mexican: 'Mexicano',
  wineBar: 'Wine Bar',
  chinese: 'Chinês',
  portuguese: 'Português',
  veganVegetarian: 'Vegano & Vegetariano',
  brazilian: 'Brasileiro',
  french: 'Francês',
  peruvian: 'Peruano',
  spanish: 'Espanhol',
  german: 'Alemão',
  indian: 'Indiano',
  international: 'Internacional',
  healthyJuices: 'Saudável & Sucos',
  beachKiosk: 'Quiosques & Barracas',
  deliGourmet: 'Empório & Delicatessen',
  other: 'Outros'
};

export default function CategorySection({ city, title, currentCategory }: CategorySectionProps) {
  const cityFormatted = formatSlug(city);
  const [cityCategories, setCityCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { isAppCheckReady } = useAppCheckContext();
  const scrollStep = 240;

  // Referência para o componente de scroll
  const containerRef = useRef<HTMLDivElement>(null);

  // Funções para rolar com os botões
  const scrollLeft = () => {
    containerRef.current?.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  };

  const scrollRight = () => {
    containerRef.current?.scrollBy({ left: scrollStep, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isAppCheckReady) return;
    const loadCats = async () => {
      try {
        setLoading(true);
        const res = await getRestaurantsByCity(city);
        const codes = res.restaurants.flatMap(r => r.categories || []);
        const uniqueCodes = Array.from(new Set(codes));
        const labels = uniqueCodes.map(code => categoryMap[code] || code);
        setCityCategories(labels);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCats();
  }, [city, isAppCheckReady]);

  // Hook para detectar se é um dispositivo móvel
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detecta dispositivo móvel com base na largura da tela e eventos de toque
  useEffect(() => {
    // Verifica se é mobile inicialmente
    const checkIfMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };

    // Verifica na primeira renderização
    checkIfMobile();

    // Adiciona listener para mudanças de tamanho da tela
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // State to show scroll arrows only when overflow
  const [showScroll, setShowScroll] = useState(false);
  useEffect(() => {
    const container = containerRef.current;
    const updateScroll = () => {
      if (container) setShowScroll(container.scrollWidth > container.clientWidth);
    };
    updateScroll();
    window.addEventListener('resize', updateScroll);
    return () => window.removeEventListener('resize', updateScroll);
  }, [cityCategories, isMobile]);

  // Determina título completo da seção
  const heading = title ?? `Categorias de Restaurantes em ${cityFormatted}`;
  // Filtra para não mostrar a categoria atual
  const displayCategories = currentCategory
    ? cityCategories.filter(cat => slugify(cat) !== currentCategory)
    : cityCategories;
  // Ordena categorias conforme ordem definida
  const categoryOrder = [
    'Bar & Pub','Pizzaria','Café & Pães & Doces','Lanches & Burgers','Churrasco & Grelhados',
    'Pastelaria','Japonês','Italiano','Mineiro','Árabe','Self-service & Buffet','Frutos do Mar',
    'Mexicano','Wine Bar','Chinês','Português','Vegano & Vegetariano','Brasileiro','Francês',
    'Peruano','Espanhol','Alemão','Indiano','Internacional','Saudável & Sucos','Quiosques & Barracas',
    'Empório & Delicatessen','Outros'
  ];
  const sortedCategories = [...displayCategories].sort((a, b) => {
    const ia = categoryOrder.indexOf(a);
    const ib = categoryOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <section className="py-12 px-6 bg-[#FFF8F0]">
      <div className="max-w-7xl mx-auto">
        {heading && (
          <h2 className="text-3xl font-bold font-['Roboto'] text-[#4A4A4A] mb-6">
            {heading}
          </h2>
        )}
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-8 h-8 border-4 border-[#F4A261] border-t-[#D32F2F] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="relative">
              {showScroll && <button onClick={scrollLeft} className="absolute left-0 top-1/2 z-10 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>}
              {isMobile ? (
                // No mobile, usamos rolagem nativa com inércia
                <div
                  ref={containerRef}
                  className="flex flex-nowrap space-x-4 overflow-x-auto pb-4 hide-scrollbar"
                  style={{ 
                    touchAction: 'pan-x',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {sortedCategories.map((cat) => {
                    const slug = slugify(cat);
                    return (
                      <Link key={cat} href={`/restaurante/${city}/${slug}`} className="flex-none w-[9.8rem] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="relative w-full h-[5.6rem]">
                          <Image
                            src={`/images/categories/${cat === 'Pastelaria' ? 'pastel' : cat === 'Outros' ? 'outros' : slugify(cat)}.webp`}
                            alt={cat}
                            fill
                            priority
                            sizes="(max-width: 640px) 100vw, 224px"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="p-4">
                          <span className="text-[#D32F2F] text-sm font-medium block text-center">{cat}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                // Em desktop, usamos o ScrollContainer para drag-to-scroll
                <ScrollContainer
                  innerRef={containerRef}
                  className="flex flex-nowrap space-x-4 overflow-x-auto pb-4 hide-scrollbar cursor-grab"
                  hideScrollbars={true}
                  activationDistance={10}
                >
                  {sortedCategories.map((cat) => {
                    const slug = slugify(cat);
                    return (
                      <Link key={cat} href={`/restaurante/${city}/${slug}`} className="flex-none w-[9.8rem] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="relative w-full h-[5.6rem]">
                          <Image
                            src={`/images/categories/${cat === 'Pastelaria' ? 'pastel' : cat === 'Outros' ? 'outros' : slugify(cat)}.webp`}
                            alt={cat}
                            fill
                            sizes="(min-width: 1024px) 16.66vw, (min-width: 768px) 25vw, (min-width: 640px) 33.33vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <span className="text-[#D32F2F] text-sm font-medium block text-center">{cat}</span>
                        </div>
                      </Link>
                    );
                  })}
                </ScrollContainer>
              )}
              {showScroll && <button onClick={scrollRight} className="absolute right-0 top-1/2 z-10 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
