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
  openingHours?: string | { day: string; hours: string }[];
  imageUrl?: string;
  rating?: number;
  priceRange?: string;
  phone?: string;
  website?: string;
  menu?: Menu[];
  reviews?: Review[];
  logo?: string;
  mainPhoto?: string;
  slug?: string;
  citySlug?: string;
  location?: { lat: number, lng: number };
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
    city: data.fiscalInformation?.fiscalAddress?.city || '',
    openingHours: data.openingHours || 'Horário não disponível',
    // Os outros campos são opcionais para iniciar, vamos extrair apenas o que precisamos
    // e implementar os demais campos gradualmente conforme necessário
  };
};

// Dados mockados para uso quando o Firestore não estiver disponível ou houver problemas de permissão
const mockRestaurants: Restaurant[] = [
  {
    id: 'mock-1',
    name: '.Gula Steak House',
    slug: 'gula-steak-house',
    description: 'Restaurante especializado em carnes premium com ambiente sofisticado.',
    address: 'Av. do Contorno, 6594 - Savassi',
    city: 'Belo Horizonte',
    citySlug: 'belo-horizonte',
    phone: '(31) 3282-1366',
    cuisine: 'Steakhouse',
    rating: 4.8,
    priceRange: '$$$$',
    imageUrl: 'https://lh3.googleusercontent.com/places/ANJU3DuAwJ2-cRHlIWnDvkVoiN_5prJnQCRoWmQg3Kt7HnJQdCOcF9Ru7v-xXQTDSIeRWLFE1e_q8yP3VJXKBYyTHWNrjP35Z01ZlWQ=s1600-w400',
    openingHours: [
      { day: 'Segunda a Quinta', hours: '12h às 15h | 19h às 23h' },
      { day: 'Sexta e Sábado', hours: '12h às 16h | 19h às 00h' },
      { day: 'Domingo', hours: '12h às 17h' }
    ],
    location: { lat: -19.9338, lng: -43.9385 }
  },
  {
    id: 'mock-2',
    name: '3 Orelhas BH',
    slug: '3-orelhas-bh',
    description: 'Bar e restaurante com pratos tradicionais mineiros e cerveja artesanal.',
    address: 'R. Leopoldina, 542 - Santo Antônio',
    city: 'Belo Horizonte',
    citySlug: 'belo-horizonte',
    phone: '(31) 3789-8040',
    cuisine: 'Brasileira',
    rating: 4.5,
    priceRange: '$$',
    imageUrl: 'https://lh3.googleusercontent.com/places/ANJU3DsTd9zZo-2rOSXYvOL1QWnqtEyMj_2CqGNm-oqOX6FIl-O_NQFm_8waNYJ3-qBFdqgeTfZvkzkSOdShcQYofg8DqPx2I9gk5kg=s1600-w400',
    openingHours: [
      { day: 'Terça a Quinta', hours: '17h às 23h' },
      { day: 'Sexta', hours: '17h às 00h' },
      { day: 'Sábado', hours: '12h às 00h' },
      { day: 'Domingo', hours: '12h às 19h' }
    ],
    location: { lat: -19.9424, lng: -43.9418 }
  },
  {
    id: 'mock-3',
    name: '3 Orelhas Bebidas',
    slug: '3-orelhas-bebidas',
    description: 'Loja de bebidas premium e cervejas artesanais.',
    address: 'R. Rio de Janeiro, 1550 - Lourdes',
    city: 'Belo Horizonte',
    citySlug: 'belo-horizonte',
    phone: '(31) 3234-5678',
    cuisine: 'Empório',
    rating: 4.7,
    priceRange: '$$',
    imageUrl: 'https://lh3.googleusercontent.com/places/ANJU3DsTd9zZo-2rOSXYvOL1QWnqtEyMj_2CqGNm-oqOX6FIl-O_NQFm_8waNYJ3-qBFdqgeTfZvkzkSOdShcQYofg8DqPx2I9gk5kg=s1600-w400',
    openingHours: [
      { day: 'Segunda a Sexta', hours: '9h às 19h' },
      { day: 'Sábado', hours: '9h às 17h' }
    ],
    location: { lat: -19.9356, lng: -43.9428 }
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
      return { id: docSnap.id, name: data.name, logo: data.logo, mainPhoto: data.mainPhoto, openingHours: data.openingHours || 'Horário não disponível' };
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
  lastVisible?: QueryDocumentSnapshot<DocumentData> | string | null,
  itemsPerPage: number = 10
): Promise<{ restaurants: Restaurant[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
  console.log(`### INÍCIO DA BUSCA DE RESTAURANTES PARA CIDADE: "${city}" ###`);
  
  try {
    // Vamos tentar uma abordagem completamente diferente - carregar todos os restaurantes
    const simpleQuery = query(collection(db, 'places'));
    const simpleSnapshot = await getDocs(simpleQuery);
    
    console.log(`Total de restaurantes encontrados: ${simpleSnapshot.size}`);
    
    // Mostrar todos os documentos e suas cidades
    const allRestaurants: {id: string, name: string, city: string}[] = [];
    const matchingRestaurants: DocumentData[] = [];
    
    simpleSnapshot.forEach(doc => {
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
    
    // Se nenhum resultado encontrado, usar os dados simulados
    if (restaurants.length === 0) {
      console.log("Nenhum restaurante encontrado para a cidade no Firestore. Usando dados simulados para demonstração.");
      
      // Filtrar os mocks para corresponder à cidade atual (insensitive)
      const cityLower = city.toLowerCase();
      const filteredMocks = mockRestaurants.filter(r => {
        const mockCity = r.city?.toLowerCase() || '';
        return mockCity.includes(cityLower) || cityLower.includes(mockCity);
      });
      
      console.log(`Usando ${filteredMocks.length} restaurantes simulados para ${city}`);
      
      return { 
        restaurants: filteredMocks,
        lastVisible: null 
      };
    }
    
    console.log(`### FIM DA BUSCA: Encontrados ${restaurants.length} restaurantes para a cidade ${city} ###`);
    
    return { 
      restaurants, 
      lastVisible: simpleSnapshot.docs[simpleSnapshot.docs.length - 1] || null 
    };
  } catch (error) {
    console.error('Erro ao buscar restaurantes por cidade:', error);
    console.log("Usando dados simulados devido a erro na busca.");
    
    // Filtrar os mocks para corresponder à cidade atual (insensitive)
    const cityLower = city.toLowerCase();
    const filteredMocks = mockRestaurants.filter(r => {
      const mockCity = r.city?.toLowerCase() || '';
      return mockCity.includes(cityLower) || cityLower.includes(mockCity);
    });
    
    console.log(`Usando ${filteredMocks.length} restaurantes simulados para ${city} devido a erro`);
    
    return { 
      restaurants: filteredMocks, 
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
    // Retorna mocks filtrados por tipo de cozinha se houver erro
    const filteredMocks = mockRestaurants.filter(r => 
      r.cuisine?.toLowerCase() === cuisine.toLowerCase()
    );
    return { restaurants: filteredMocks, lastVisible: null };
  }
};
