'use client';
import React, { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';
import { getRestaurantsByCity, Restaurant } from '@/lib/restaurantService';

interface RestaurantsListProps {
  city: string;
}

// Normalize city strings to slug form
const normalize = (str: string) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function RestaurantsList({ city }: RestaurantsListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { restaurants } = await getRestaurantsByCity(city);
        setRestaurants(restaurants);
      } catch (err: any) {
        console.error('RestaurantsList fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [city]);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-12 h-12 border-4 border-[#F4A261] border-t-[#D32F2F] rounded-full animate-spin"></div></div>;
  }
  if (error) {
    return <div className="text-center text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
    </div>
  );
}
