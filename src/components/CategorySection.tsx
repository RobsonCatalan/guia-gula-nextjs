'use client';

import React, { useState, useEffect } from 'react';
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

interface CategorySectionProps {
  city: string;
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

export default function CategorySection({ city }: CategorySectionProps) {
  const [cityCategories, setCityCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
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
  }, [city]);

  return (
    <section className="py-12 px-6 bg-[#FFF8F0]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold font-['Roboto'] text-[#4A4A4A] mb-6">Categorias de Restaurantes</h2>
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-8 h-8 border-4 border-[#F4A261] border-t-[#D32F2F] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cityCategories.map((cat) => {
              const slug = slugify(cat);
              return (
                <Link
                  key={cat}
                  href={`/restaurante/${city}/${slug}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 block"
                >
                  <div className="relative w-full h-32 overflow-hidden rounded-t-lg mb-2">
                    <Image
                      src={`/images/categories/${cat === 'Pastelaria' ? 'pastel' : cat === 'Outros' ? 'outros' : slugify(cat)}.webp`}
                      alt={cat}
                      fill
                      sizes="(min-width: 1024px) 16.66vw, (min-width: 768px) 25vw, (min-width: 640px) 33.33vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[#D32F2F] font-medium block text-center">{cat}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
