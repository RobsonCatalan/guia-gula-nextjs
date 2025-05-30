import React from 'react';
import { formatSlug, stateNames } from '@/lib/utils';
import Link from 'next/link';

interface StateCitySelectionProps {
  stateOptions: { value: string; label: string }[];
  initialState: string;
  initialCities: string[];
}

export default function StateCitySelection({ stateOptions, initialState, initialCities }: StateCitySelectionProps) {
  return (
    <>
      {/* Server-rendered state dropdown */}
      <section className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="block mb-2 text-[#4A4A4A] font-medium">Selecione um Estado</h2>
          <select
            id="state-select"
            defaultValue={initialState}
            className="w-full max-w-sm px-4 py-2 border border-[#4A4A4A] rounded bg-white text-black shadow-sm"
          >
            {stateOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {stateNames[opt.value] ?? opt.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Server-rendered city grid */}
      <section className="pt-6 pb-[30px] bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#4A4A4A] mb-6">
            Selecione a cidade em {stateNames[initialState] ?? formatSlug(initialState)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {initialCities.map(city => (
              <Link
                key={city}
                href={`/restaurante/${city}`}
                className="block p-6 bg-white rounded shadow hover:shadow-md transition"
              >
                {formatSlug(city)}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
