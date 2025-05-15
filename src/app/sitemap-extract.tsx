// Página TEMPORÁRIA para extração de dados para sitemap estático
'use client';
import React, { useEffect, useState } from 'react';
import { getAllCities, getRestaurantsByCity } from '@/lib/restaurantService';
import { slugify } from '@/lib/utils';

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

export default function SitemapExtract() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const result: any = { cities: [], cityCategories: {}, restaurants: {} };
      const cities = await getAllCities();
      result.cities = cities;
      for (const city of cities) {
        const { restaurants } = await getRestaurantsByCity(city);
        result.restaurants[city] = restaurants.map(r => ({
          name: r.name,
          slug: slugify(r.name),
          categories: r.categories || [],
        }));
        // Categorias presentes na cidade
        const catSet = new Set<string>();
        restaurants.forEach(r => (r.categories || []).forEach(code => catSet.add(code)));
        result.cityCategories[city] = Array.from(catSet);
      }
      setData(result);
      setLoading(false);
    }
    fetchAll();
  }, []);

  return (
    <div className="p-4 text-sm font-mono">
      <h1 className="text-xl font-bold mb-2">Extração de dados para Sitemap</h1>
      {loading && <p>Carregando...</p>}
      {data && (
        <>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto max-h-[60vh]">{JSON.stringify(data, null, 2)}</pre>
          <p className="mt-4 text-green-700">Copie o JSON acima para montar seu sitemap estático.</p>
        </>
      )}
    </div>
  );
}
