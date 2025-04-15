'use client';

import { useEffect, useState } from 'react';
import { Restaurant, getRestaurantsByCity } from '@/lib/restaurantService';
import RestaurantCard from '@/components/RestaurantCard';

interface RestaurantClientProps {
  cidade: string;
}

export default function ClientComponent({ 
  cidade 
}: RestaurantClientProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // Função inicial para carregar os restaurantes quando o componente montar
  useEffect(() => {
    async function loadInitialRestaurants() {
      try {
        console.log(`Buscando restaurantes para: ${cidade}`);
        const { restaurants: initialRestaurants, lastVisible } = 
          await getRestaurantsByCity(cidade, null, 10);
        
        // Garantir que o array de restaurantes seja válido
        setRestaurants(Array.isArray(initialRestaurants) ? initialRestaurants : []);
        setLastDocId(lastVisible?.id || null);
        setHasMore(!!lastVisible && Array.isArray(initialRestaurants) && initialRestaurants.length > 0);
        console.log(`Encontrados ${initialRestaurants?.length || 0} restaurantes para ${cidade}`);
      } catch (err) {
        console.error('Erro ao carregar restaurantes:', err);
        setError('Não foi possível carregar os restaurantes. Tente novamente mais tarde.');
        // Garantir que temos um array vazio em caso de erro
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    loadInitialRestaurants();
  }, [cidade]);

  const loadMoreRestaurants = async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);

      // Recupera mais restaurantes a partir do último documento visível
      const { restaurants: newRestaurants, lastVisible: newLastVisible } = 
        await getRestaurantsByCity(cidade, lastDocId, 6);
      
      // Garantir que o array de novos restaurantes seja válido
      const validNewRestaurants = Array.isArray(newRestaurants) ? newRestaurants : [];
      
      setRestaurants(prev => [...prev, ...validNewRestaurants]);
      setLastDocId(newLastVisible?.id || null);
      setHasMore(!!newLastVisible && validNewRestaurants.length > 0);
    } catch (err) {
      console.error('Erro ao carregar mais restaurantes:', err);
      setError('Não foi possível carregar mais restaurantes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Garantir que renderizamos apenas quando temos um array válido
  const restaurantsArray = restaurants || [];

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading && restaurantsArray.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Carregando restaurantes...</p>
        </div>
      ) : restaurantsArray.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurantsArray.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">
            Não encontramos restaurantes em {cidade}.
          </p>
        </div>
      )}
      
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreRestaurants}
            disabled={loading}
            className="bg-[#D32F2F] text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
}
