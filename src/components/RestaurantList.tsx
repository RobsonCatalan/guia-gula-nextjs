'use client';

import { useState, useEffect } from 'react';
import { Restaurant, getRestaurants } from '@/lib/restaurantService';
import RestaurantCard from './RestaurantCard';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadRestaurants = async (reset: boolean = false) => {
    if (typeof window === 'undefined') return; // Garantir que só executa no cliente
    
    try {
      setLoading(true);
      
      // Se for reset, começamos do início
      const lastDoc = reset ? undefined : lastVisible;
      
      // Garantir que lastDoc é undefined ou QueryDocumentSnapshot, nunca null
      const { restaurants: newRestaurants, lastVisible: newLastVisible } = 
        await getRestaurants(lastDoc || undefined, 6);
      
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
      loadRestaurants(true);
    }
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadRestaurants();
    }
  };

  return (
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
  );
}
