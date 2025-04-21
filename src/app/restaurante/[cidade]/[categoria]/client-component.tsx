'use client';

import React, { useEffect, useState } from 'react';
import { Restaurant, getRestaurantsByCity } from '@/lib/restaurantService';
import RestaurantCard from '@/components/RestaurantCard';

interface CategoryClientComponentProps {
  cidade: string;
  categoria: string;
}

// Mapeamento de códigos de categoria para labels
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

// Função para gerar slug a partir do label
const slugify = (str: string) =>
  str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

// Obtém o código da categoria a partir do slug
const getCodeFromSlug = (slug: string) =>
  Object.entries(categoryMap).find(([, label]) => slugify(label) === slug)?.[0] || slug;

export default function CategoryClientComponent({ cidade, categoria }: CategoryClientComponentProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { restaurants: all } = await getRestaurantsByCity(cidade);
        const code = getCodeFromSlug(categoria);
        const filtered = all.filter(r => (r.categories || []).includes(code));
        setRestaurants(filtered);
      } catch (err) {
        console.error('Erro ao carregar restaurantes por categoria:', err);
        setError('Não foi possível carregar restaurantes dessa categoria.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cidade, categoria]);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 border-4 border-[#F4A261] border-t-[#D32F2F] rounded-full animate-spin"></div>
        </div>
      ) : restaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(r => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl font-medium text-[#4A4A4A]">
            Nenhum restaurante encontrado nessa categoria.
          </p>
        </div>
      )}
    </>
  );
}
