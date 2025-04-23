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
  cuisine?: string;
  openingHours?: string;
  imageUrl?: string;
  rating?: number;
  priceRange?: string;
  phone?: string;
  website?: string;
  logo?: string;
  mainPhoto?: string;
  instagramLink?: string;
  // Map guideConfig categories (English codes) to array
  categories?: string[];
  reviewCount?: number;
  workingHours?: { weekday: number; startTime: number; endTime: number }[];
}

// Interface para o cardápio
export interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

// Interface para avaliações
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}

// Função para sanitizar e validar dados de restaurante
const sanitizeRestaurant = (data: DocumentData): Restaurant => ({
  id: data.id || '',
  name: data.name || '',
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
});

// Verifica se estamos no ambiente de cliente e tem acesso ao Firestore
const isClient = typeof window !== 'undefined';

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
    const ratingStats = await getAverageRatings(restaurants.map(r => r.id));
    const restaurantsWithStats = restaurants.map(r => ({
      ...r,
      rating: ratingStats[r.id]?.avg ?? 0,
      reviewCount: ratingStats[r.id]?.count ?? 0,
    }));
    return { restaurants: restaurantsWithStats, lastVisible: newLastVisible };
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
      return sanitizeRestaurant({ id: docSnap.id, ...docSnap.data() });
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
    // Fetch all restaurants and filter manually by city slug (handles accents)
    const q = query(
      collection(db, 'places'),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    const allRestaurants: Restaurant[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.guideConfig?.isVisible) {
        allRestaurants.push(sanitizeRestaurant({ id: doc.id, ...data }));
      }
    });
    // Normalize string to slug
    const normalize = (str: string) =>
      str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    const targetSlug = normalize(city);
    const filtered = allRestaurants.filter(r => normalize(r.city || '') === targetSlug);
    // Calcular média de avaliações e contagem de reviews
    const ratingStats = await getAverageRatings(filtered.map(r => r.id));
    const restaurantsWithStats = filtered.map(r => ({
      ...r,
      rating: ratingStats[r.id]?.avg ?? 0,
      reviewCount: ratingStats[r.id]?.count ?? 0,
    }));
    return { restaurants: restaurantsWithStats, lastVisible: null };
  } catch (error) {
    console.error('Erro ao buscar restaurantes por cidade:', error);
    return { 
      restaurants: [], 
      lastVisible: null 
    };
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

// Adicionar função para calcular média de avaliações de restaurantes
export const getAverageRatings = async (restaurantIds: string[]): Promise<Record<string, { avg: number; count: number }>> => {
  if (!isClient) {
    return {};
  }
  const ratingsMap: Record<string, { sum: number; count: number }> = {};
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
  return statsMap;
};
