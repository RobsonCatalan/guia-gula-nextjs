'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Restaurant, getRestaurants, getRestaurantsByCity, getAverageRatings } from '@/lib/restaurantService';
import RestaurantCard from './RestaurantCard';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import Head from 'next/head';
import { haversineDistance } from '@/lib/utils';

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
  // Estado para armazenar avaliações carregadas assincronamente
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  // Refs para controlar IDs já buscados e evitar fetchs repetidos
  const fetchedDistancesRef = useRef<Set<string>>(new Set());
  const fetchedRatingsRef = useRef<boolean>(false);

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

  // Carregamento assíncrono das avaliações
  useEffect(() => {
    async function loadRatings() {
      // Evita carregar avaliações se já foram carregadas ou não há restaurantes
      if (fetchedRatingsRef.current || restaurants.length === 0) {
        return;
      }

      try {
        // Marca como já buscado para evitar múltiplas chamadas
        fetchedRatingsRef.current = true;
        
        // Busca avaliações para todos os restaurantes
        const restaurantIds = restaurants.map(r => r.id);
        const ratingsData = await getAverageRatings(restaurantIds);
        
        // Atualiza o estado com as avaliações
        setRatings(ratingsData);
        console.log('Avaliações carregadas com sucesso na Home:', Object.keys(ratingsData).length);
      } catch (err) {
        console.error('Erro ao carregar avaliações na Home:', err);
      }
    }

    loadRatings();
  }, [restaurants]);

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

  // Obtém localização do usuário
  useEffect(() => {
    if (!userLocation && typeof window !== 'undefined') {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        err => console.error('Geolocation error:', err)
      );
    }
  }, [userLocation]);

  // Calcula distância em linha reta para cada restaurante
  useEffect(() => {
    if (userLocation) {
      const map: Record<string, { duration: number; text: string }> = {};
      restaurants.forEach(r => {
        if (r.coordinates) {
          const d = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            r.coordinates.latitude,
            r.coordinates.longitude
          );
          map[r.id] = { duration: d, text: `${d.toFixed(1)} km` };
        }
      });
      setDriveTimes(map);
    }
  }, [userLocation, restaurants]);

  // Ordena restaurantes com base na opção selecionada
  const sortedRestaurants = useMemo(() => {
    const arr = [...restaurants];
    if (sortOption === 'time') {
      arr.sort((a, b) => (driveTimes[a.id]?.duration ?? Infinity) - (driveTimes[b.id]?.duration ?? Infinity));
    } else {
      // Usa as avaliações carregadas assincronamente se disponíveis, senão usa as do restaurante
      arr.sort((a, b) => {
        const ratingA = ratings[a.id]?.avg !== undefined ? ratings[a.id]?.avg : (a.rating || 0);
        const ratingB = ratings[b.id]?.avg !== undefined ? ratings[b.id]?.avg : (b.rating || 0);
        return ratingB - ratingA;
      });
    }
    return arr;
  }, [restaurants, driveTimes, sortOption, ratings]);

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
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant} 
                driveTime={driveTimes[restaurant.id]?.text}
                rating={ratings[restaurant.id]?.avg}
                reviewCount={ratings[restaurant.id]?.count}
              />
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
