'use client';

import { useEffect, useState, useContext } from 'react';
import { useAppCheckContext } from '@/components/FirebaseAppCheckProvider';
import { Restaurant, getRestaurantsByCity } from '@/lib/restaurantService';
import RestaurantCard from '@/components/RestaurantCard';
import Head from 'next/head';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface RestaurantClientProps {
  cidade: string;
}

export default function ClientComponent({ 
  cidade 
}: RestaurantClientProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const { isAppCheckReady } = useAppCheckContext();
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // Preparar JSON-LD para SEO após carregamento de restaurantes
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

  // Função inicial para carregar os restaurantes quando o componente montar
  useEffect(() => {
    async function loadInitialRestaurants() {
      if (!isAppCheckReady) {
        console.log('[ClientComponent] App Check not ready yet, skipping initial fetch.');
        setLoading(true);
        return;
      }
      
      setLoading(true);
      try {
        console.log(`Buscando restaurantes para: ${cidade}`);
        
        // Tentativa de buscar com timeout para evitar esperas muito longas
        const timeoutPromise = new Promise<{ restaurants: Restaurant[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }>(
          (_, reject) => setTimeout(() => reject(new Error('Timeout buscando restaurantes')), 15000)
        );
        
        const fetchPromise = getRestaurantsByCity(cidade, null, 10);
        
        // Race entre o timeout e a busca normal
        const { restaurants: initialRestaurants, lastVisible } = 
          await Promise.race([fetchPromise, timeoutPromise]);
        
        // Garantir que o array de restaurantes seja válido
        setRestaurants(Array.isArray(initialRestaurants) ? initialRestaurants : []);
        setLastDocId(lastVisible?.id || null);
        setHasMore(!!lastVisible && Array.isArray(initialRestaurants) && initialRestaurants.length > 0);
        console.log(`Encontrados ${initialRestaurants?.length || 0} restaurantes para ${cidade}`);
      } catch (err) {
        console.error('Erro ao carregar restaurantes:', err);
        setError('Não foi possível carregar os restaurantes. Por favor, tente novamente mais tarde ou verifique sua conexão.');
        // Garantir que temos um array vazio em caso de erro
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    loadInitialRestaurants();
  }, [cidade, isAppCheckReady]);

  const loadMoreRestaurants = async () => {
    if (loading || !hasMore || !isAppCheckReady) return;
    
    try {
      setLoading(true);
      console.log(`Carregando mais restaurantes a partir do documento: ${lastDocId}`);

      // Recupera mais restaurantes a partir do último documento visível
      const { restaurants: newRestaurants, lastVisible: newLastVisible } = 
        await getRestaurantsByCity(cidade, lastDocId, 6);
      
      // Garantir que o array de novos restaurantes seja válido
      const validNewRestaurants = Array.isArray(newRestaurants) ? newRestaurants : [];
      
      // Adicionar os novos restaurantes ao estado
      if (validNewRestaurants.length > 0) {
        console.log(`Adicionando ${validNewRestaurants.length} novos restaurantes`);
        
        setRestaurants(prev => [...prev, ...validNewRestaurants]);
        
        // Se temos um novo último documento visível, atualizamos o lastDocId
        if (newLastVisible) {
          setLastDocId(newLastVisible.id);
          setHasMore(true);
        } else {
          // Se não temos um novo último documento visível, não há mais para carregar
          setHasMore(false);
        }
      } else {
        console.log('Não foram encontrados novos restaurantes');
        setHasMore(false);
      }
    } catch (err) {
      console.error('Erro ao carregar mais restaurantes:', err);
      setError('Não foi possível carregar mais restaurantes. Por favor, tente novamente mais tarde ou verifique sua conexão.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Garantir que renderizamos apenas quando temos um array válido
  const restaurantsArray = Array.isArray(restaurants) ? restaurants : [];

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
      <div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {(!isAppCheckReady || (loading && restaurantsArray.length === 0)) ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-[#F4A261] border-t-[#D32F2F] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">
              {!isAppCheckReady ? 'Inicializando segurança...' : 'Carregando restaurantes...'}
            </p>
          </div>
        ) : restaurantsArray.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantsArray.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[#FFF8F0] rounded-lg border border-[#4A4A4A]/10 p-6">
            <div className="w-16 h-16 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#F4A261]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-medium text-[#4A4A4A] mb-2">
              Não encontramos restaurantes em {cidade}
            </p>
            <p className="text-[#4A4A4A]/70">
              Tente buscar por outras cidades ou volte mais tarde quando houver novos restaurantes cadastrados.
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
    </>
  );
}
