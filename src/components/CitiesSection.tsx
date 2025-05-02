'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ScrollContainer from 'react-indiana-drag-scroll';
import { useAppCheckContext } from '@/components/FirebaseAppCheckProvider';
import { getAllCities } from '@/lib/restaurantService';

interface CitiesSectionProps {
  currentCity?: string;
}

export default function CitiesSection({ currentCity }: CitiesSectionProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [failedImgs, setFailedImgs] = useState<Record<string, boolean>>({});
  const { isAppCheckReady } = useAppCheckContext();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const scrollStep = 240;
  const scrollLeft = () => containerRef.current?.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  const scrollRight = () => containerRef.current?.scrollBy({ left: scrollStep, behavior: 'smooth' });

  useEffect(() => {
    if (!isAppCheckReady) return;
    async function loadCities() {
      try {
        const slugs = await getAllCities();
        setCities(slugs);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    }
    loadCities();
  }, [isAppCheckReady]);

  useEffect(() => {
    const checkMobile = () => {
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(touch && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [showScroll, setShowScroll] = useState(false);
  useEffect(() => {
    const container = containerRef.current;
    const updateScroll = () => {
      if (container) setShowScroll(container.scrollWidth > container.clientWidth);
    };
    updateScroll();
    window.addEventListener('resize', updateScroll);
    return () => window.removeEventListener('resize', updateScroll);
  }, [cities, isMobile]);

  const normalizeLabel = (slug: string) =>
    slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\bSao\b/g, 'São');

  const handleImgError = (slug: string) => {
    setFailedImgs(prev => ({ ...prev, [slug]: true }));
  };

  return (
    <>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="relative">
        {showScroll && <button onClick={scrollLeft} className="absolute left-0 top-1/2 z-10 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>}
        {isMobile ? (
          <div ref={containerRef} className="flex flex-nowrap space-x-4 overflow-x-auto pb-4 hide-scrollbar" style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}>
            {cities.filter(slug => slug !== currentCity).map(slug => {
              const label = normalizeLabel(slug);
              return (
                <Link key={slug} href={`/restaurante/${slug}`} className="flex-none w-[9.8rem] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="relative w-full h-[5.6rem]">
                    <Image
                      src={`/images/cities/${slug}.webp`}
                      alt={label}
                      fill
                      sizes="(min-width: 1024px) 16.66vw, (min-width: 768px) 25vw, (min-width: 640px) 33.33vw, 50vw"
                      className="object-cover"
                      onError={() => handleImgError(slug)}
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[#D32F2F] text-sm font-medium block text-center">{label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <ScrollContainer innerRef={containerRef} className="flex flex-nowrap space-x-4 overflow-x-auto pb-4 hide-scrollbar cursor-grab" hideScrollbars={true} activationDistance={10}>
            {cities.filter(slug => slug !== currentCity).map(slug => {
              const label = normalizeLabel(slug);
              return (
                <Link key={slug} href={`/restaurante/${slug}`} className="flex-none w-[9.8rem] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="relative w-full h-[5.6rem]">
                    <Image
                      src={`/images/cities/${slug}.webp`}
                      alt={label}
                      fill
                      sizes="(min-width: 1024px) 16.66vw, (min-width: 768px) 25vw, (min-width: 640px) 33.33vw, 50vw"
                      className="object-cover"
                      onError={() => handleImgError(slug)}
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[#D32F2F] text-sm font-medium block text-center">{label}</span>
                  </div>
                </Link>
              );
            })}
          </ScrollContainer>
        )}
        {showScroll && <button onClick={scrollRight} className="absolute right-0 top-1/2 z-10 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>}
      </div>
    </>
  );
}
