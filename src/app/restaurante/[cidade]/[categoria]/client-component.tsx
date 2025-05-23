'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Restaurant, getRestaurantsByCity, getAverageRatings } from '@/lib/restaurantService';
import RestaurantCard from '@/components/RestaurantCard';

interface CategoryClientComponentProps {
  cidade: string;
  categoria: string;
  initialRestaurants?: Restaurant[];
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

export default function CategoryClientComponent({ cidade, categoria, initialRestaurants = [] }: CategoryClientComponentProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [loading, setLoading] = useState<boolean>(initialRestaurants.length === 0);
  const [error, setError] = useState<string | null>(null);
  // Estados para ordenação e cálculo de tempo de viagem
  const [sortOption, setSortOption] = useState<'time' | 'rating'>('time');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [driveTimes, setDriveTimes] = useState<Record<string, { duration: number; text: string }>>({});
  // Estado para armazenar avaliações carregadas assincronamente
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  // Ref para controlar se as avaliações já foram buscadas
  const fetchedRatingsRef = useRef<boolean>(false);

  // Converte duração textual em minutos
  const parseDuration = (text: string): number => {
    const matchH = text.match(/(\d+)\s*hour/);
    const matchM = text.match(/(\d+)\s*min/);
    const hours = matchH ? parseInt(matchH[1]) : 0;
    const mins = matchM ? parseInt(matchM[1]) : 0;
    return hours * 60 + mins;
  };

  useEffect(() => {
    async function load() {
      if (initialRestaurants.length > 0) return;
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
  }, [cidade, categoria, initialRestaurants]);

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
        console.log('Avaliações carregadas com sucesso:', Object.keys(ratingsData).length);
      } catch (err) {
        console.error('Erro ao carregar avaliações:', err);
      }
    }

    loadRatings();
  }, [restaurants]);

  // Geolocalização do usuário
  useEffect(() => {
    if (!userLocation && typeof window !== 'undefined') {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        err => console.error('Erro ao obter geolocalização:', err)
      );
    }
  }, [userLocation]);

  // Busca tempo de viagem para cada restaurante
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
            .catch(err => console.error('Erro Distance API:', err));
        }
      });
    }
  }, [userLocation, restaurants, driveTimes]);

  // Lista ordenada com base na opção selecionada
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
        <>
          {/* Controle de ordenação */}
          <div className="flex justify-end mb-4">
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value as 'time' | 'rating')}
              className="px-4 py-2 border border-[#4A4A4A] rounded bg-white text-[#4A4A4A] focus:outline-none shadow-md"
            >
              <option value="time">Menor tempo</option>
              <option value="rating">Melhor avaliado</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRestaurants.map(r => (
              <RestaurantCard 
                key={r.id} 
                restaurant={r} 
                driveTime={driveTimes[r.id]?.text}
                rating={ratings[r.id]?.avg}
                reviewCount={ratings[r.id]?.count}
              />
            ))}
          </div>
        </>
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
