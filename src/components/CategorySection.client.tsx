'use client';

import React, { useState, useEffect, useRef } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import Link from 'next/link';
import Image from 'next/image';
import { slugify } from '@/lib/utils';

interface CategorySectionClientProps {
  city: string;
  title?: string;
  currentCategory?: string;
  categories: string[];
}

const categoryOrder: string[] = [
  'Bar & Pub','Pizzaria','Café & Pães & Doces','Lanches & Burgers','Churrasco & Grelhados',
  'Pastelaria','Japonês','Italiano','Mineiro','Árabe','Self-service & Buffet','Frutos do Mar',
  'Mexicano','Wine Bar','Chinês','Português','Vegano & Vegetariano','Brasileiro','Francês',
  'Peruano','Espanhol','Alemão','Indiano','Internacional','Saudável & Sucos','Quiosques & Barracas',
  'Empório & Delicatessen','Outros'
];

export default function CategorySectionClient({ city, title, currentCategory, categories }: CategorySectionClientProps) {
  const heading = title;
  const displayCategories = currentCategory
    ? categories.filter(cat => slugify(cat) !== currentCategory)
    : categories;
  const sortedCategories = [...displayCategories].sort((a, b) => {
    const ia = categoryOrder.indexOf(a);
    const ib = categoryOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showScroll, setShowScroll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollStep = 240;

  useEffect(() => {
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(touch && window.innerWidth < 768);
    const handleResize = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isTouch && window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const updateScroll = () => {
      if (container) setShowScroll(container.scrollWidth > container.clientWidth);
    };
    updateScroll();
    window.addEventListener('resize', updateScroll);
    return () => window.removeEventListener('resize', updateScroll);
  }, [sortedCategories, isMobile]);

  const scrollLeft = () => containerRef.current?.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  const scrollRight = () => containerRef.current?.scrollBy({ left: scrollStep, behavior: 'smooth' });

  return (
    <section className="py-6 px-6 bg-[#ECE2D9]">
      <div className="max-w-7xl mx-auto">
        {heading && (
          <h2 className="text-3xl font-bold font-['Roboto'] text-[#4A4A4A] mb-6">
            {heading}
          </h2>
        )}
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <div className="relative">
          {showScroll && (
            <button onClick={scrollLeft} className="absolute left-0 top-1/2 z-10 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {isMobile ? (
            <div
              ref={containerRef}
              className="flex flex-nowrap space-x-4 overflow-x-auto pb-0 hide-scrollbar"
              style={{
                touchAction: 'pan-x pan-y',
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
                        unoptimized
                        priority
                        sizes="(max-width: 640px) 100vw, 224px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-[#FF5842] text-sm font-medium block text-center">{cat}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <ScrollContainer
              innerRef={containerRef}
              className="flex flex-nowrap space-x-4 overflow-x-auto pb-0 hide-scrollbar cursor-grab"
              hideScrollbars
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
                        unoptimized
                        sizes="(min-width: 1024px) 16.66vw, (min-width: 768px) 25vw, (min-width: 640px) 33.33vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-[#FF5842] text-sm font-medium block text-center">{cat}</span>
                    </div>
                  </Link>
                );
              })}
            </ScrollContainer>
          )}
          {showScroll && (
            <button onClick={scrollRight} className="absolute right-0 top-1/2 z-10 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
