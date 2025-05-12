// src/lib/restaurantService.ts
import { collection, getDocs, getDoc, doc, query, where, limit, orderBy, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Interface que define a estrutura de um restaurante
export interface Restaurant {
  id: string;
  name: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressDistrict?: string;
  addressState?: string;
  postalCode?: string;
  coordinates?: { latitude: number; longitude: number } | null;
  menu?: Menu[];
  addressCity?: string;
  address?: string;
  city?: string;
  description?: string;
  shortDescription?: string;
  cuisine?: string;
  openingHours?: string;
  imageUrl?: string;
  rating?: number;
  priceRange?: string;
  phone?: string;
  website?: string;
  logo?: string;
  mainPhoto?: string;
  mainMenuShowcaseImages?: string[];
  welcomeScreenImages?: string[];
  instagramLink?: string;
  // Map guideConfig categories (English codes) to array
  categories?: string[];
  reviewCount?: number;
  workingHours?: { weekday: number; startTime: number; endTime: number }[];
  // Delivery configuration flags
  deliveryConfig?: {
    enabled: boolean;
    deliveryDisabled: boolean;
    takeoutDisabled: boolean;
    openNow?: boolean;
    workingHours?: { weekday: number; startTime: number; endTime: number }[];
    contactNumber?: string;
  };
}

// Interface para o cardápio
export interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  appearanceOrder?: number;
  sectionName: string;
  sectionAppearanceOrder: number;
}

// Interface para avaliações
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment?: string;
  date: Date | string;
  user?: string;
  userReference?: any;
  placeReference?: any;
  order?: string;
  orderReference?: any;
}

// Função para sanitizar e validar dados de restaurante
const sanitizeRestaurant = (data: DocumentData): Restaurant => ({
  id: data.id || '',
  name: data.name || '',
  shortDescription: data.shortDescription || '',
  address: data.fiscalInformation?.fiscalAddress?.formattedAddress || data.address || '',
  city: data.guideConfig?.address?.city || data.city || '',
  description: data.description || '',
  cuisine: data.cuisineType || data.cuisine || '',
  openingHours: data.openingHours || 'Horário não disponível',
  imageUrl: data.mainPhoto || data.imageUrl || '/images/placeholder-restaurant.jpg',
  rating: data.rating || 0,
  priceRange: data.priceRange || '$',
  phone: data.contactInfo?.phoneNumber || data.phone || '',
  website: data.contactInfo?.website || data.website || '',
  instagramLink: data.instagramLink || '',
  logo: data.logo || null,
  mainPhoto: data.mainPhoto || null,
  mainMenuShowcaseImages: Array.isArray(data.mainMenuShowcaseImages) ? data.mainMenuShowcaseImages : [],
  welcomeScreenImages: Array.isArray(data.welcomeScreenImages) ? data.welcomeScreenImages : [],
  // Map guideConfig categories (English codes) to array
  categories: Array.isArray(data.guideConfig?.categories) ? data.guideConfig.categories : [],
  // Endereço detalhado do guideConfig
  addressStreet: data.guideConfig?.address?.street || '',
  addressNumber: data.guideConfig?.address?.number || '',
  addressComplement: data.guideConfig?.address?.complement || '',
  addressDistrict: data.guideConfig?.address?.district || '',
  addressState: data.guideConfig?.address?.state || '',
  postalCode: data.guideConfig?.address?.postalCode || '',
  addressCity: data.guideConfig?.address?.city || data.city || '',
  coordinates: data.guideConfig?.address?.coordinates
    ? { latitude: data.guideConfig.address.coordinates.latitude, longitude: data.guideConfig.address.coordinates.longitude }
    : null,
  menu: Array.isArray(data.menu) ? data.menu : [],
  workingHours: Array.isArray(data.guideConfig?.workingHours)
    ? data.guideConfig.workingHours.map((wh: any) => ({
        weekday: wh.weekday,
        startTime: wh.startTime,
        endTime: wh.endTime,
      }))
    : [],
  deliveryConfig: {
    enabled: data.deliveryConfig?.enabled ?? false,
    deliveryDisabled: data.deliveryConfig?.deliveryDisabled ?? false,
    takeoutDisabled: data.deliveryConfig?.takeoutDisabled ?? false,
    openNow: data.deliveryConfig?.openNow ?? false,
    workingHours: Array.isArray(data.deliveryConfig?.workingHours)
      ? data.deliveryConfig.workingHours.map((wh: any) => ({
          weekday: wh.weekday,
          startTime: wh.startTime,
          endTime: wh.endTime,
        }))
      : [],
    contactNumber: data.deliveryConfig?.contactNumber || data.contactInfo?.phoneNumber || '',
  },
});

// Verifica se estamos no ambiente de cliente e tem acesso ao Firestore
const isClient = typeof window !== 'undefined';

// Adiciona tratamento de erro para conexões do Firestore
const handleFirestoreError = (error: any) => {
  console.error('Erro na conexão com o Firestore:', error);
  
  // Verifica se é um erro de conexão ou autenticação
  if (error?.code === 'permission-denied' || 
      error?.code === 'unauthenticated' || 
      error?.message?.includes('404') ||
      error?.message?.includes('PERMISSION_DENIED')) {
    console.warn('Problema de permissão ou configuração do Firestore. Usando dados em cache se disponíveis.');
    
    // Aqui poderia implementar uma lógica de fallback para dados em cache
    return true;
  }
  
  return false;
};

// Obter todos os restaurantes com paginação
export const getRestaurants = async (
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  if (!isClient) {
    console.log('Executando no ambiente servidor - não é possível acessar o Firestore');
    return { restaurants: [], lastVisible: null };
  }
  try {
    // Verificar cache (expira em 1 hora)
    const cacheKey = `restaurants-${itemsPerPage}-${lastVisible?.id || 'initial'}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Verificar se o cache ainda é válido (1 hora = 3600000 ms)
      if (Date.now() - timestamp < 3600000) {
        console.log('Usando dados em cache para restaurantes');
        return data;
      } else {
        // Cache expirado, remover
        sessionStorage.removeItem(cacheKey);
      }
    }
    
    try {
      // Buscar todos os restaurantes localmente
      const snapshot = await getDocs(query(collection(db, 'places'), orderBy('name')));
      // Filtrar somente visíveis
      const visibleDocs = snapshot.docs.filter(doc => doc.data().guideConfig?.isVisible);
      // Ordenar por nome
      visibleDocs.sort((a, b) => (a.data().name || '').localeCompare(b.data().name || ''));
      // Paginação: determinar índice de início
      const startIndex = lastVisible
        ? visibleDocs.findIndex(d => d.id === lastVisible.id) + 1
        : 0;
      // Extrair documentos da página atual
      const pageDocs = visibleDocs.slice(startIndex, startIndex + itemsPerPage);
      // Sanitizar restaurantes
      const restaurants = pageDocs.map(d => sanitizeRestaurant({ id: d.id, ...d.data() }));
      // Novo cursor para paginação
      const newLastVisible = pageDocs.length ? pageDocs[pageDocs.length - 1] : null;
      
      // Calcular média de avaliações e contagem de reviews
      let ratingStats: Record<string, { avg: number; count: number }> = {};
      try {
        ratingStats = await getAverageRatings(restaurants.map(r => r.id));
      } catch (ratingError) {
        console.warn('Erro ao buscar avaliações, usando valores padrão:', ratingError);
        // Continua com ratingStats vazio
      }
      
      const restaurantsWithStats = restaurants.map(r => ({
        ...r,
        rating: ratingStats[r.id]?.avg ?? r.rating ?? 0,
        reviewCount: ratingStats[r.id]?.count ?? 0,
      }));
      
      const result = { 
        restaurants: restaurantsWithStats, 
        lastVisible: newLastVisible 
      };
      
      // Armazenar em cache por 1 hora
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Erro ao armazenar em cache:', e);
      }
      
      return result;
    } catch (firestoreError) {
      // Tratar erro do Firestore
      if (handleFirestoreError(firestoreError)) {
        // Se tiver dados em cache antigos, usar como fallback
        const oldCachedData = localStorage.getItem(cacheKey);
        if (oldCachedData) {
          console.log('Usando dados em cache antigos como fallback');
          try {
            const { data } = JSON.parse(oldCachedData);
            return data;
          } catch (e) {
            console.error('Erro ao processar cache antigo:', e);
          }
        }
      }
      throw firestoreError; // Re-lançar para ser capturado pelo catch externo
    }
  } catch (error) {
    console.error('Erro ao buscar restaurantes:', error);
    return { restaurants: [], lastVisible: null };
  }
};

// Obter um restaurante específico por ID
export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  // Se não estiver no cliente, retorna null (será preenchido pelo lado do cliente)
  if (!isClient) {
    return null;
  }

  try {
    const docRef = doc(db, 'places', id); 
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Verificar se o restaurante é visível antes de retornar
      const data = docSnap.data();
      if (data.guideConfig?.isVisible === true) {
        return sanitizeRestaurant({ id: docSnap.id, ...data });
      }
      return null; // Retorna null se o restaurante não for visível
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar restaurante por ID:', error);
    return null;
  }
};

// Obter restaurantes por cidade
export const getRestaurantsByCity = async (
  city: string,
  lastVisibleParam?: QueryDocumentSnapshot<DocumentData> | string | null,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    // Convert slug to displayable city name
    const displayCity = city
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/\bSao\b/g, 'São');

    // Verificar se temos dados em cache (apenas no cliente)
    if (typeof window !== 'undefined') {
      const cacheKey = `restaurants-city-${city}-${itemsPerPage}-${lastVisibleParam || 'initial'}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // Verificar se o cache ainda é válido (1 hora = 3600000 ms)
        if (Date.now() - timestamp < 3600000) {
          console.log(`Usando dados em cache para cidade: ${city}`);
          return data;
        } else {
          // Cache expirado, remover
          sessionStorage.removeItem(cacheKey);
        }
      }
    }

    // Query only restaurants in this city
    const q = query(
      collection(db, 'places'),
      where('guideConfig.address.city', '==', displayCity)
    );
    const snapshot = await getDocs(q);
    
    // Filtrar apenas restaurantes visíveis
    const restaurants: Restaurant[] = snapshot.docs
      .filter(doc => doc.data().guideConfig?.isVisible === true)
      .map(doc => sanitizeRestaurant({ id: doc.id, ...(doc.data() as any) }));

    // Sort by name
    restaurants.sort((a, b) => a.name.localeCompare(b.name));
    
    const result = { restaurants, lastVisible: null };
    
    // Armazenar em cache (apenas no cliente)
    if (typeof window !== 'undefined') {
      try {
        const cacheKey = `restaurants-city-${city}-${itemsPerPage}-${lastVisibleParam || 'initial'}`;
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Erro ao armazenar em cache:', e);
      }
    }
    
    return result;
  } catch (error) {
    // Suppress error logging to avoid permission errors in console
    return { restaurants: [], lastVisible: null };
  }
};

// Obter restaurantes por tipo de cozinha
export const getRestaurantsByCuisine = async (
  cuisine: string,
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  // Se não estiver no cliente, retorna array vazio (será preenchido pelo lado do cliente)
  if (!isClient) {
    return { restaurants: [], lastVisible: null };
  }

  try {
    // Buscar todos os restaurantes localmente
    const snapshot = await getDocs(query(collection(db, 'places'), orderBy('name')));
    // Filtrar somente visíveis
    const visibleDocs = snapshot.docs.filter(doc => doc.data().guideConfig?.isVisible);
    // Ordenar por nome
    visibleDocs.sort((a, b) => (a.data().name || '').localeCompare(a.data().name || ''));
    // Paginação: determinar índice de início
    const startIndex = lastVisible
      ? visibleDocs.findIndex(d => d.id === lastVisible.id) + 1
      : 0;
    // Extrair documentos da página atual
    const pageDocs = visibleDocs.slice(startIndex, startIndex + itemsPerPage);
    // Sanitizar restaurantes
    const restaurants = pageDocs.map(d => sanitizeRestaurant({ id: d.id, ...d.data() }));
    // Novo cursor para paginação
    const newLastVisible = pageDocs.length ? pageDocs[pageDocs.length - 1] : null;
    // Calcular média de avaliações e contagem de reviews
    const ratingStats = await getAverageRatings(restaurants.map(r => r.id));
    const restaurantsWithStats = restaurants.map(r => ({
      ...r,
      rating: ratingStats[r.id]?.avg ?? 0,
      reviewCount: ratingStats[r.id]?.count ?? 0,
    }));
    return { restaurants: restaurantsWithStats, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Erro ao buscar restaurantes por tipo de cozinha:', error);
    return { restaurants: [], lastVisible: null };
  }
};

// Obter todas as cidades (slugs) do Firestore
export const getAllCities = async (): Promise<string[]> => {
  if (!isClient) return [];
  try {
    const snapshot = await getDocs(collection(db, 'places'));
    const visibleDocs = snapshot.docs.filter(d => d.data().guideConfig?.isVisible);
    const slugsSet = new Set<string>();
    visibleDocs.forEach(doc => {
      const data = doc.data();
      const cityRaw = data.guideConfig?.address?.city || data.city || '';
      if (cityRaw) {
        const slug = cityRaw
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        slugsSet.add(slug);
      }
    });
    return Array.from(slugsSet);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

// Adicionar função para calcular média de avaliações de restaurantes
export const getAverageRatings = async (restaurantIds: string[]): Promise<Record<string, { avg: number; count: number }>> => {
  if (!isClient) {
    return {};
  }
  
  // Se não houver IDs, retorna objeto vazio
  if (!restaurantIds || restaurantIds.length === 0) {
    return {};
  }
  
  try {
    // Verificar cache
    const cacheKey = `ratings-${restaurantIds.sort().join('-')}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Verificar se o cache ainda é válido (1 hora = 3600000 ms)
      if (Date.now() - timestamp < 3600000) {
        console.log('Usando dados em cache para avaliações');
        return data;
      } else {
        // Cache expirado, remover
        sessionStorage.removeItem(cacheKey);
      }
    }
    
    const ratingsMap: Record<string, { sum: number; count: number }> = {};
    
    // Processa em chunks de 10 para evitar limitações do Firestore
    for (let i = 0; i < restaurantIds.length; i += 10) {
      const chunk = restaurantIds.slice(i, i + 10);
      const refs = chunk.map(id => doc(db, 'places', id));
      const reviewsQuery = query(collection(db, 'placeReviews'), where('placeReference', 'in', refs));
      const snapshot = await getDocs(reviewsQuery);
      
      snapshot.forEach(reviewDoc => {
        const data = reviewDoc.data();
        const ratingValue = data.rating;
        const ref: any = data.placeReference;
        const refId = ref.id;
        
        if (!ratingsMap[refId]) {
          ratingsMap[refId] = { sum: 0, count: 0 };
        }
        
        ratingsMap[refId].sum += ratingValue;
        ratingsMap[refId].count += 1;
      });
    }
    
    const statsMap: Record<string, { avg: number; count: number }> = {};
    
    Object.entries(ratingsMap).forEach(([id, { sum, count }]) => {
      statsMap[id] = { avg: parseFloat((sum / count).toFixed(1)), count };
    });
    
    // Armazenar em cache por 1 hora
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: statsMap,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Erro ao armazenar avaliações em cache:', e);
    }
    
    return statsMap;
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return {};
  }
};

// Obter reviews de um restaurante específico
export const getRestaurantReviews = async (restaurantId: string): Promise<Review[]> => {
  if (!isClient) {
    return [];
  }
  
  try {
    // Verificar cache
    const cacheKey = `reviews-${restaurantId}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Verificar se o cache ainda é válido (1 hora = 3600000 ms)
      if (Date.now() - timestamp < 3600000) {
        console.log(`Usando dados em cache para reviews do restaurante ${restaurantId}`);
        return data;
      } else {
        // Cache expirado, remover
        sessionStorage.removeItem(cacheKey);
      }
    }
    
    const placeRef = doc(db, 'places', restaurantId);
    const reviewsQuery = query(
      collection(db, 'placeReviews'), 
      where('placeReference', '==', placeRef),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(reviewsQuery);
    const reviews: Review[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        userName: data.userName || 'Usuário',
        rating: data.rating || 0,
        comment: data.comment || '',
        date: data.date ? new Date(data.date.toDate()) : new Date(),
        user: data.user || '',
        order: data.order || '',
      });
    });
    
    // Armazenar em cache por 1 hora
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: reviews,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Erro ao armazenar reviews em cache:', e);
    }
    
    return reviews;
  } catch (error) {
    console.error('Erro ao buscar reviews:', error);
    return [];
  }
};

// Busca itens do cardápio filtrando pelo placeId e condições isVisible e deleted
export const getMenuItems = async (placeId: string): Promise<Menu[]> => {
  const placeRef = doc(db, 'places', placeId);
  const q = query(
    collection(db, 'menuItems'),
    where('place', '==', placeRef),
    where('isVisible', '==', true),
    where('deleted', '==', false)
  );
  const snapshot = await getDocs(q);
  // Ordenação client-side por appearanceOrder
  const items: Menu[] = snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || '',
      description: data.description || '',
      price: data.price || 0,
      category: data.category || '',
      image: data.shortImage || '',
      appearanceOrder: data.appearanceOrder || 0,
      sectionName: data.sectionName || '',
      sectionAppearanceOrder: data.sectionAppearanceOrder || 0,
    };
  });
  items.sort((a, b) => (a.appearanceOrder! - b.appearanceOrder!));
  return items;
};

// Função para contar reviews por rating (estrelas)
export const countReviewsByRating = (reviews: Review[]): Record<number, number> => {
  const counts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };
  
  reviews.forEach(review => {
    const rating = Math.floor(review.rating);
    if (rating >= 1 && rating <= 5) {
      counts[rating]++;
    }
  });
  
  return counts;
};
