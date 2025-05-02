'use client';

import { useState, useEffect, useMemo } from 'react';
import { Restaurant, getRestaurants, getRestaurantsByCity } from '@/lib/restaurantService';
import RestaurantCard from './RestaurantCard';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import Head from 'next/head';

export interface RestaurantListProps {
  city?: string;
}

export default function RestaurantList({ city }: RestaurantListProps) {
  // Formata slug de cidade para exibição
  const formatSlug = (str: string) =>
    str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Sao', 'São');
  const cityFormatted = city ? formatSlug(city) : '';
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Estados para ordenação e cálculo de tempo de viagem
  const [sortOption, setSortOption] = useState<'time' | 'rating'>('time');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [driveTimes, setDriveTimes] = useState<Record<string, { duration: number; text: string }>>({});

  const loadRestaurants = async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    try {
      const res = city
        ? await getRestaurantsByCity(city)
        : await getRestaurants();
      setRestaurants(res.restaurants);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar restaurantes:', err);
      setError('Não foi possível carregar os restaurantes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, [city]);

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

  // Converte duração textual em minutos
  const parseDuration = (text: string): number => {
    const matchH = text.match(/(\d+)\s*hour/);
    const matchM = text.match(/(\d+)\s*min/);
    const hours = matchH ? parseInt(matchH[1]) : 0;
    const mins = matchM ? parseInt(matchM[1]) : 0;
    return hours * 60 + mins;
  };

  // Obtém localização do usuário
  useEffect(() => {
    if (!userLocation && typeof window !== 'undefined') {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        err => console.error('Geolocation error:', err)
      );
    }
  }, [userLocation]);

  // Busca tempos de viagem para cada restaurante
  useEffect(() => {
    if (userLocation) {
      restaurants.forEach(r => {
        if (r.coordinates && !driveTimes[r.id]) {
          const origin = `${userLocation.latitude},${userLocation.longitude}`;
          const dest = `${r.coordinates.latitude},${r.coordinates.longitude}`;
          fetch(`/api/distance?origin=${origin}&destination=${dest}`)
            .then(res => res.json())
            .then(data => {
              if (data.duration) {
                const duration = parseDuration(data.duration);
                setDriveTimes(prev => ({ ...prev, [r.id]: { duration, text: data.duration } }));
              }
            })
            .catch(err => console.error('Distance API error:', err));
        }
      });
    }
  }, [userLocation, restaurants, driveTimes]);

  // Ordena restaurantes com base na opção selecionada
  const sortedRestaurants = useMemo(() => {
    const arr = [...restaurants];
    if (sortOption === 'time') {
      arr.sort((a, b) => (driveTimes[a.id]?.duration ?? Infinity) - (driveTimes[b.id]?.duration ?? Infinity));
    } else {
      arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return arr;
  }, [restaurants, driveTimes, sortOption]);

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
        {restaurants.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#4A4A4A]">Destaques</h2>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value as 'time' | 'rating')}
              className="px-4 py-2 border border-[#4A4A4A] rounded bg-white text-[#4A4A4A] focus:outline-none shadow-md"
            >
              <option value="time">Menor tempo</option>
              <option value="rating">Melhor avaliado</option>
            </select>
          </div>
        )}
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
            {sortedRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="w-10 h-10 border-4 border-[#F4A261] border-t-[#FF5842] rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </>
  );
}
