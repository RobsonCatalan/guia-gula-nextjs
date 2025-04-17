// src/lib/restaurantService.ts
import { collection, getDocs, getDoc, doc, query, where, limit, orderBy, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Interface que define a estrutura de um restaurante
export interface Restaurant {
  id: string;
  name: string;
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
  menu?: Menu[];
  reviews?: Review[];
  logo?: string;
  mainPhoto?: string;
  photos?: string[];
  isVerified?: boolean;
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
const sanitizeRestaurant = (data: DocumentData): Restaurant => {
  return {
    id: data.id || '',
    name: data.name || '',
    address: data.fiscalInformation?.fiscalAddress?.formattedAddress || data.address || '',
    city: data.fiscalInformation?.fiscalAddress?.city || data.city || '',
    description: data.description || '',
    cuisine: data.cuisineType || data.cuisine || '',
    openingHours: data.openingHours || 'Horário não disponível',
    imageUrl: data.mainPhoto || data.imageUrl || '/images/placeholder-restaurant.jpg',
    rating: data.rating || 0,
    priceRange: data.priceRange || '$',
    phone: data.contactInfo?.phoneNumber || data.phone || '',
    website: data.contactInfo?.website || data.website || '',
    logo: data.logo || null,
    mainPhoto: data.mainPhoto || null
  };
};

// Verifica se estamos no ambiente de cliente e tem acesso ao Firestore
const isClient = typeof window !== 'undefined';

// Obter todos os restaurantes com paginação
export const getRestaurants = async (
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  // Se não estiver no cliente, retorna array vazio (será preenchido pelo lado do cliente)
  if (!isClient) {
    console.log('Executando no ambiente servidor - não é possível acessar o Firestore');
    return { 
      restaurants: [], 
      lastVisible: null 
    };
  }

  try {
    let q;
    
    if (lastVisible) {
      q = query(
        collection(db, 'places'), 
        orderBy('name'), 
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
    } else {
      q = query(
        collection(db, 'places'), 
        orderBy('name'), 
        limit(itemsPerPage)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const restaurants: Restaurant[] = [];
    let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
    
    if (!querySnapshot.empty) {
      newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Passar o documento completo para sanitizeRestaurant
        restaurants.push(sanitizeRestaurant({ 
          id: doc.id, 
          ...data 
        }));
      });
    }
    
    // Calcular média de avaliações para este lote
    const avgRatings = await getAverageRatings(restaurants.map(r => r.id));
    const restaurantsWithAvg = restaurants.map(r => ({
      ...r,
      rating: avgRatings[r.id] ?? 0
    }));
    
    return { restaurants: restaurantsWithAvg, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Erro ao buscar restaurantes:', error);
    // Retornamos um array vazio em vez de dados mockados
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
  if (!isClient) {
    return { restaurants: [], lastVisible: null };
  }

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
      allRestaurants.push(sanitizeRestaurant({ id: doc.id, ...data }));
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
    // Calculate average ratings
    const avgRatings = await getAverageRatings(filtered.map(r => r.id));
    const restaurantsWithAvg = filtered.map(r => ({ ...r, rating: avgRatings[r.id] ?? 0 }));
    return { restaurants: restaurantsWithAvg, lastVisible: null };
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
    let q;
    
    if (lastVisible) {
      q = query(
        collection(db, 'places'), 
        where('cuisine', '==', cuisine),
        orderBy('name'), 
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
    } else {
      q = query(
        collection(db, 'places'), 
        where('cuisine', '==', cuisine),
        orderBy('name'), 
        limit(itemsPerPage)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const restaurants: Restaurant[] = [];
    let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
    
    if (!querySnapshot.empty) {
      newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Passar o documento completo para sanitizeRestaurant
        restaurants.push(sanitizeRestaurant({ 
          id: doc.id, 
          ...data 
        }));
      });
    }
    
    return { restaurants, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Erro ao buscar restaurantes por tipo de cozinha:', error);
    // Retornamos array vazio em vez de dados mockados
    return { restaurants: [], lastVisible: null };
  }
};

// Adicionar função para calcular média de avaliações de restaurantes
export const getAverageRatings = async (restaurantIds: string[]): Promise<Record<string, number>> => {
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
  const avgMap: Record<string, number> = {};
  Object.entries(ratingsMap).forEach(([id, { sum, count }]) => {
    avgMap[id] = parseFloat((sum / count).toFixed(1));
  });
  return avgMap;
};
