'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatSlug, stateNames } from '@/lib/utils';
import CitiesSection from '@/components/CitiesSection';

interface HomePageClientProps {
  stateOptions: { value: string; label: string }[];
  initialState: string;
  initialCities: string[];
}

export default function HomePageClient({ stateOptions, initialState, initialCities }: HomePageClientProps) {
  const router = useRouter();
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [cities, setCities] = useState<string[]>(initialCities);

  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const cookie of cookies) {
      const [rawName, ...rest] = cookie.split('=');
      if (rawName.trim() === name) return decodeURIComponent(rest.join('='));
    }
    return null;
  }

  function setCookie(name: string, value: string) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${30 * 24 * 60 * 60}`;
  }

  useEffect(() => {
    const cityCookie = getCookie('selectedCity');
    if (cityCookie) {
      router.push(`/restaurante/${cityCookie}`);
      return;
    }
    const stateCookie = getCookie('selectedState');
    const st = stateCookie || initialState;
    setSelectedState(st);
    setCookie('selectedState', st);
  }, []);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const st = e.target.value;
    setSelectedState(st);
    setCookie('selectedState', st);
    fetch(`/api/cities?state=${st}`)
      .then(res => res.json())
      .then(data => setCities(data.cities));
  };

  const handleCityClick = (slug: string) => {
    setCookie('selectedCity', slug);
    router.push(`/restaurante/${slug}`);
  };

  return (
    <div className="bg-[#FFF8F0]">
      <section className="py-6 px-6 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto">
          <h2 className="block mb-2 text-[#4A4A4A] font-medium">Selecione um Estado</h2>
          <select
            id="state-select"
            value={selectedState}
            onChange={handleStateChange}
            className="w-full max-w-sm px-4 py-2 border border-[#4A4A4A] rounded bg-white text-black shadow-sm"
          >
            {stateOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </section>
      <section className="py-6 mt-0 px-6 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#4A4A4A] mb-6">Selecione a cidade em {stateNames[selectedState] || formatSlug(selectedState)}</h2>
          <CitiesSection allowedCities={cities} currentState={selectedState} />
        </div>
      </section>
    </div>
  );
}
