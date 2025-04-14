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
    logo: data.logo || '',
    mainPhoto: data.mainPhoto || '',
    // Os outros campos são opcionais para iniciar, vamos extrair apenas o que precisamos
    // e implementar os demais campos gradualmente conforme necessário
  };
};

// Dados mockados para uso quando o Firestore não estiver disponível ou houver problemas de permissão
const mockRestaurants: Restaurant[] = [
  {
    id: 'mock1',
    name: 'Cantina Italiana',
    address: 'Rua Augusta, 1200',
    city: 'São Paulo',
    description: 'A melhor cantina italiana da cidade com massas artesanais e molhos tradicionais da culinária italiana.',
    cuisine: 'italiana',
    openingHours: 'Segunda a Sábado das 11h às 23h, Domingo das 11h às 16h',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    rating: 4.7,
    priceRange: '$$',
    phone: '(11) 3256-7890',
    website: 'www.cantinaitaliana.com.br'
  },
  {
    id: 'mock2',
    name: 'Sushi Koba',
    address: 'Rua Pamplona, 1704',
    city: 'São Paulo',
    description: 'Autêntica culinária japonesa com os melhores e mais frescos peixes do mercado.',
    cuisine: 'japonesa',
    openingHours: 'Terça a Domingo das 18h às 23h',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VzaGl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    rating: 4.9,
    priceRange: '$$$',
    phone: '(11) 3884-1234',
    website: 'www.sushikoba.com.br'
  },
  {
    id: 'mock3',
    name: 'Churrascaria Fogo de Chão',
    address: 'Av. Moreira Guimarães, 964',
    city: 'São Paulo',
    description: 'A melhor experiência de churrasco brasileiro com carnes nobres e rodízio tradicional.',
    cuisine: 'brasileira',
    openingHours: 'Todos os dias das 12h às 23h',
    imageUrl: 'https://images.unsplash.com/photo-1594041680838-eb93a78fd4d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNodXJyYXNjb3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    rating: 4.5,
    priceRange: '$$$$',
    phone: '(11) 5093-0101',
    website: 'www.fogodechao.com.br'
  }
];

// Verifica se estamos no ambiente de cliente e tem acesso ao Firestore
const isClient = typeof window !== 'undefined';

// Obter todos os restaurantes com paginação
export const getRestaurants = async (
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  // Se não estiver no cliente, retorna dados mockados
  if (!isClient) {
    console.log('Usando dados mockados para restaurantes (ambiente servidor)');
    return { 
      restaurants: mockRestaurants, 
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
        restaurants.push(sanitizeRestaurant({ id: doc.id, name: data.name, logo: data.logo, mainPhoto: data.mainPhoto }));
      });
    }
    
    return { restaurants, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Erro ao buscar restaurantes:', error);
    console.log('Usando dados mockados devido a erro de acesso ao Firestore');
    return { restaurants: mockRestaurants, lastVisible: null };
  }
};

// Obter um restaurante específico por ID
export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  // Se não estiver no cliente, retorna dado mockado correspondente
  if (!isClient) {
    const mockRestaurant = mockRestaurants.find(r => r.id === id);
    return mockRestaurant || null;
  }

  try {
    const docRef = doc(db, 'places', id); 
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { id: docSnap.id, name: data.name, logo: data.logo, mainPhoto: data.mainPhoto };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar restaurante por ID:', error);
    // Tenta encontrar no mock se houver erro
    const mockRestaurant = mockRestaurants.find(r => r.id === id);
    return mockRestaurant || null;
  }
};

// Obter restaurantes por cidade
export const getRestaurantsByCity = async (
  city: string,
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  // Se não estiver no cliente, filtra os dados mockados
  if (!isClient) {
    const filteredMocks = mockRestaurants.filter(r => 
      r.city?.toLowerCase() === city.toLowerCase()
    );
    return { restaurants: filteredMocks, lastVisible: null };
  }

  try {
    let q;
    
    if (lastVisible) {
      q = query(
        collection(db, 'places'), 
        where('city', '==', city),
        orderBy('name'), 
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
    } else {
      q = query(
        collection(db, 'places'), 
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
        restaurants.push(sanitizeRestaurant({ id: doc.id, name: data.name, logo: data.logo, mainPhoto: data.mainPhoto }));
      });
    }
    
    return { restaurants, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Erro ao buscar restaurantes por cidade:', error);
    // Retorna mocks filtrados por cidade se houver erro
    const filteredMocks = mockRestaurants.filter(r => 
      r.city?.toLowerCase() === city.toLowerCase()
    );
    return { restaurants: filteredMocks, lastVisible: null };
  }
};

// Obter restaurantes por tipo de cozinha
export const getRestaurantsByCuisine = async (
  cuisine: string,
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  // Se não estiver no cliente, filtra os dados mockados
  if (!isClient) {
    const filteredMocks = mockRestaurants.filter(r => 
      r.cuisine?.toLowerCase() === cuisine.toLowerCase()
    );
    return { restaurants: filteredMocks, lastVisible: null };
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
        restaurants.push(sanitizeRestaurant({ id: doc.id, name: data.name, logo: data.logo, mainPhoto: data.mainPhoto }));
      });
    }
    
    return { restaurants, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Erro ao buscar restaurantes por tipo de cozinha:', error);
    // Retorna mocks filtrados por tipo de cozinha se houver erro
    const filteredMocks = mockRestaurants.filter(r => 
      r.cuisine?.toLowerCase() === cuisine.toLowerCase()
    );
    return { restaurants: filteredMocks, lastVisible: null };
  }
};
