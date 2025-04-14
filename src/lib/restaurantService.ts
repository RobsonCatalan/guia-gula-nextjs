// src/lib/restaurantService.ts
import { collection, getDocs, getDoc, doc, query, where, limit, orderBy, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Interface que define a estrutura de um restaurante
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  cuisine: string;
  openingHours: string;
  imageUrl: string;
  rating: number;
  priceRange: string;
  phone?: string;
  website?: string;
  menu?: Menu[];
  reviews?: Review[];
}

// Interface para o cardápio
export interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
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
    address: data.address || '',
    city: data.city || '',
    description: data.description || '',
    cuisine: data.cuisine || '',
    openingHours: data.openingHours || '',
    imageUrl: data.imageUrl || '',
    rating: typeof data.rating === 'number' ? data.rating : 0,
    priceRange: data.priceRange || '',
    phone: data.phone || '',
    website: data.website || '',
    menu: Array.isArray(data.menu) ? data.menu.map(item => ({
      id: item.id || '',
      name: item.name || '',
      description: item.description || '',
      price: typeof item.price === 'number' ? item.price : 0,
      category: item.category || '',
      imageUrl: item.imageUrl || '',
    })) : [],
    reviews: Array.isArray(data.reviews) ? data.reviews.map(review => ({
      id: review.id || '',
      userName: review.userName || '',
      rating: typeof review.rating === 'number' ? review.rating : 0,
      comment: review.comment || '',
      date: review.date instanceof Date ? review.date : new Date(),
    })) : [],
  };
};

// Obter todos os restaurantes com paginação
export const getRestaurants = async (
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    let q;
    
    if (lastVisible) {
      q = query(
        collection(db, 'restaurants'),
        orderBy('name'),
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
    } else {
      q = query(
        collection(db, 'restaurants'),
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
        restaurants.push(sanitizeRestaurant({ ...data, id: doc.id }));
      });
    }
    
    return { restaurants, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Erro ao buscar restaurantes:', error);
    return { restaurants: [], lastVisible: null };
  }
};

// Obter um restaurante específico por ID
export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  try {
    const docRef = doc(db, 'restaurants', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return sanitizeRestaurant({ ...data, id: docSnap.id });
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
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    let q;
    
    if (lastVisible) {
      q = query(
        collection(db, 'restaurants'),
        where('city', '==', city),
        orderBy('name'),
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
    } else {
      q = query(
        collection(db, 'restaurants'),
        where('city', '==', city),
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
        restaurants.push(sanitizeRestaurant({ ...data, id: doc.id }));
      });
    }
    
    return { restaurants, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Erro ao buscar restaurantes por cidade:', error);
    return { restaurants: [], lastVisible: null };
  }
};

// Obter restaurantes por tipo de cozinha
export const getRestaurantsByCuisine = async (
  cuisine: string,
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    let q;
    
    if (lastVisible) {
      q = query(
        collection(db, 'restaurants'),
        where('cuisine', '==', cuisine),
        orderBy('name'),
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
    } else {
      q = query(
        collection(db, 'restaurants'),
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
        restaurants.push(sanitizeRestaurant({ ...data, id: doc.id }));
      });
    }
    
    return { restaurants, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Erro ao buscar restaurantes por tipo de cozinha:', error);
    return { restaurants: [], lastVisible: null };
  }
};
