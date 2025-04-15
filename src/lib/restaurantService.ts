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
    
    return { restaurants, lastVisible: newLastVisible };
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
  lastVisible?: QueryDocumentSnapshot<DocumentData> | string | null,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  // Se não estiver no cliente, retorna array vazio (será preenchido pelo lado do cliente)
  if (!isClient) {
    return { restaurants: [], lastVisible: null };
  }
  
  const matchingRestaurants: any[] = [];
  
  console.log(`### INÍCIO DA BUSCA DE RESTAURANTES PARA CIDADE: "${city}" ###`);
  
  try {
    // Tentar abordagem completa - carregar todos os restaurantes primeiro
    const simpleQuery = query(collection(db, 'places'), limit(50)); // Limitando para 50 para evitar timeout
    const simpleSnapshot = await getDocs(simpleQuery);
    
    console.log(`Total de restaurantes encontrados: ${simpleSnapshot.size}`);
    
    // Mostrar todos os documentos e suas cidades
    const allRestaurants: {id: string, name: string, city: string}[] = [];
    
    simpleSnapshot.forEach((doc) => {
      const data = doc.data();
      const restaurantName = data.name || 'Sem nome';
      const cityValue = data.fiscalInformation?.fiscalAddress?.city || data.city || '';
      
      allRestaurants.push({
        id: doc.id,
        name: restaurantName,
        city: cityValue
      });
      
      // Verificar se corresponde à cidade que estamos buscando (case insensitive)
      const targetCity = city.toLowerCase();
      const currentCity = cityValue.toLowerCase();
      
      // Só corresponde se:
      // 1. A cidade atual não estiver vazia E
      // 2. A cidade atual contiver o texto da cidade buscada OU a cidade buscada contiver o texto da cidade atual
      if (currentCity && 
          (currentCity.includes(targetCity) || 
          targetCity.includes(currentCity) ||
          (targetCity === 'belo horizonte' && (currentCity === 'bh' || currentCity === 'b.h.' || currentCity === 'belzonte')))) {
        console.log(`*** CORRESPONDÊNCIA ENCONTRADA: ${restaurantName}, Cidade: ${cityValue} ***`);
        matchingRestaurants.push({id: doc.id, ...data});
      }
    });
    
    // Imprimir todos os restaurantes encontrados
    console.log("=== TODOS OS RESTAURANTES E SUAS CIDADES ===");
    allRestaurants.forEach(r => {
      console.log(`ID: ${r.id}, Nome: ${r.name}, Cidade: ${r.city}`);
    });
    
    // Processar os restaurantes correspondentes
    const restaurants: Restaurant[] = matchingRestaurants.map(data => 
      sanitizeRestaurant({id: data.id, ...data})
    );
    
    console.log(`### FIM DA BUSCA: Encontrados ${restaurants.length} restaurantes para a cidade ${city} ###`);
    
    return { 
      restaurants, 
      lastVisible: simpleSnapshot.docs[simpleSnapshot.docs.length - 1] || null 
    };
  } catch (error) {
    console.error('Erro ao buscar restaurantes por cidade:', error);
    return { 
      restaurants: [], // Retornamos array vazio em vez de dados mockados 
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
