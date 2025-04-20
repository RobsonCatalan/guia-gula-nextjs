'use client';

import { useState, useEffect } from 'react';
import { Restaurant, getRestaurants, getRestaurantsByCity } from '@/lib/restaurantService';
import RestaurantCard from './RestaurantCard';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import Head from 'next/head';

export interface RestaurantListProps {
  city?: string;
}

export default function RestaurantList({ city }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadRestaurants = async (reset: boolean = false) => {
    if (typeof window === 'undefined') return; // only client
    setLoading(true);
    try {
      const lastDoc = reset ? undefined : lastVisible;
      const res = city
        ? await getRestaurantsByCity(city, lastDoc || undefined, 6)
        : await getRestaurants(lastDoc || undefined, 6);
      const { restaurants: newRestaurants, lastVisible: newLastVisible } = res;

      if (reset) {
        setRestaurants(newRestaurants);
      } else {
        setRestaurants(prev => [...prev, ...newRestaurants]);
      }
      setLastVisible(newLastVisible);
      setHasMore(!!newLastVisible && newRestaurants.length > 0);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar restaurantes:', err);
      setError('Não foi possível carregar os restaurantes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLastVisible(null);
      loadRestaurants(true);
    }
  }, [city]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadRestaurants();
    }
  };

  // Preparar JSON-LD para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: restaurants.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Restaurant',
        name: r.name,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1
        }
      }
    }))
  };

  return (
    <>
      {restaurants.length > 0 && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </Head>
      )}
      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-6">Restaurantes em Destaque</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {restaurants.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <p className="text-[#4A4A4A]">Nenhum restaurante encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center my-8">
            <div className="w-10 h-10 border-4 border-[#F4A261] border-t-[#D32F2F] rounded-full animate-spin"></div>
          </div>
        )}
        
        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={handleLoadMore}
              className="bg-[#D32F2F] text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
            >
              Carregar mais
            </button>
          </div>
        )}
      </div>
    </>
  );
}
