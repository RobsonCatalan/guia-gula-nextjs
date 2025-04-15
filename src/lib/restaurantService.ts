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
  lastVisibleParam?: QueryDocumentSnapshot<DocumentData> | string | null,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  // Se não estiver no cliente, retorna array vazio (será preenchido pelo lado do cliente)
  if (!isClient) {
    return { restaurants: [], lastVisible: null };
  }

  try {
    console.log(`Buscando restaurantes para cidade: ${city}`);
    
    // Se lastVisibleParam é uma string (ID do documento), precisamos obter o documento real
    let lastDocumentId: string | null = null;
    
    if (lastVisibleParam && typeof lastVisibleParam === 'string') {
      lastDocumentId = lastVisibleParam;
      console.log(`Usando último documento ID: ${lastDocumentId}`);
    } else if (lastVisibleParam && typeof lastVisibleParam === 'object') {
      lastDocumentId = lastVisibleParam.id;
      console.log(`Usando último documento do objeto: ${lastDocumentId}`);
    }
    
    // Criando a consulta base - precisamos considerar variações do nome da cidade
    const cityLower = city.toLowerCase();
    
    // Consultas para cada variação possível do nome da cidade
    const cityVariations = [cityLower];
    
    // Adiciona variações para Belo Horizonte
    if (cityLower === 'belo horizonte') {
      cityVariations.push('bh', 'b.h.', 'belzonte');
    }

    // Vamos trazer uma lista maior de restaurantes para permitir paginação
    // Limitado a 100 para evitar problemas de desempenho
    const baseQuery = query(
      collection(db, 'places'),
      orderBy('name'),
      limit(100)
    );
    
    console.log(`Executando consulta base...`);
    const querySnapshot = await getDocs(baseQuery);
    console.log(`Total de documentos retornados: ${querySnapshot.size}`);
    
    // Lista para guardar os ids dos restaurantes encontrados
    const allRestaurantIds: string[] = [];
    const cityRestaurantIds: string[] = [];
    
    // Primeiro passo: identificar todos os restaurantes da cidade em questão
    querySnapshot.forEach(doc => {
      allRestaurantIds.push(doc.id);
      
      const data = doc.data();
      const cityValue = data.fiscalInformation?.fiscalAddress?.city || data.city || '';
      
      if (cityValue && cityVariations.some(variant => 
          cityValue.toLowerCase().includes(variant) || 
          variant.includes(cityValue.toLowerCase()))) {
        cityRestaurantIds.push(doc.id);
      }
    });
    
    console.log(`Total de restaurantes: ${allRestaurantIds.length}`);
    console.log(`Total de restaurantes em ${city}: ${cityRestaurantIds.length}`);
    
    // Determinar o índice do último documento visto
    let startIdx = 0;
    if (lastDocumentId) {
      const lastIdx = cityRestaurantIds.indexOf(lastDocumentId);
      if (lastIdx !== -1) {
        startIdx = lastIdx + 1; // Começamos a partir do próximo
        console.log(`Último documento encontrado na posição ${lastIdx}, começando da posição ${startIdx}`);
      } else {
        console.log(`Documento com ID ${lastDocumentId} não encontrado na lista.`);
      }
    }
    
    // Verificar se já mostramos todos os restaurantes
    if (startIdx >= cityRestaurantIds.length) {
      console.log(`Não há mais restaurantes para mostrar (${startIdx} >= ${cityRestaurantIds.length})`);
      return {
        restaurants: [],
        lastVisible: null
      };
    }
    
    // Pegar o próximo lote de restaurantes
    const nextBatchIds = cityRestaurantIds.slice(startIdx, startIdx + itemsPerPage);
    console.log(`Obtendo próximo lote de ${nextBatchIds.length} restaurantes a partir da posição ${startIdx}`);
    
    // Processar os restaurantes do próximo lote
    const nextBatchRestaurants: Restaurant[] = [];
    let lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null;
    
    for (const id of nextBatchIds) {
      // Procurar o documento no querySnapshot
      const docSnapshot = querySnapshot.docs.find(doc => doc.id === id);
      if (docSnapshot) {
        const data = docSnapshot.data();
        nextBatchRestaurants.push(sanitizeRestaurant({
          id: docSnapshot.id,
          ...data
        }));
        lastVisibleDoc = docSnapshot;
      }
    }
    
    console.log(`Retornando ${nextBatchRestaurants.length} restaurantes para ${city}`);
    
    return {
      restaurants: nextBatchRestaurants,
      lastVisible: lastVisibleDoc
    };
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
