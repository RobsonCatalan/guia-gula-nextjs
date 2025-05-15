import type { MetadataRoute } from 'next';

const baseUrl = 'https://gula.menu';

interface SitemapData {
  cities: string[];
  cityCategories: { [city: string]: string[] };
  restaurants: { [city: string]: { name: string; slug: string; categories: string[] }[] };
}

const sitemapData: SitemapData = {
  cities: [
    'sao-paulo', 'belo-horizonte', 'ouro-preto', 'brumadinho',
    'governador-valadares', 'contagem', 'lagoa-santa', 'estiva'
  ],
  cityCategories: {
    'sao-paulo': [
      'barbecueGrill', 'snacksBurgers', 'brazilian', 'cafeBakeryDesserts',
      'international', 'barPub', 'french', 'veganVegetarian', 'other',
      'chinese', 'arabic', 'italian'
    ],
    'belo-horizonte': [
      'seafood', 'barPub', 'veganVegetarian', 'brazilian', 'selfServiceBuffet',
      'barbecueGrill', 'snacksBurgers', 'cafeBakeryDesserts', 'italian',
      'pizza', 'mineiro', 'wineBar', 'indian', 'japanese', 'mexican',
      'deliGourmet', 'other'
    ],
    'ouro-preto': ['cafeBakeryDesserts', 'deliGourmet'],
    'brumadinho': ['cafeBakeryDesserts', 'veganVegetarian', 'brazilian'],
    'governador-valadares': ['barPub'],
    'contagem': ['barbecueGrill', 'barPub'],
    'lagoa-santa': ['barPub', 'mexican'],
    'estiva': ['snacksBurgers', 'barbecueGrill']
  },
  restaurants: {
    "sao-paulo": [
      {"name": "Backstage", "slug": "backstage", "categories": ["barbecueGrill","snacksBurgers"]},
      {"name": "Casa Mezcla", "slug": "casa-mezcla", "categories": ["brazilian","cafeBakeryDesserts"]},
      {"name": "Casa Oliva", "slug": "casa-oliva", "categories": ["brazilian","cafeBakeryDesserts"]},
      {"name": "Cazzo", "slug": "cazzo", "categories": ["international"]},
      {"name": "Clemente Café", "slug": "clemente-cafe", "categories": ["cafeBakeryDesserts"]},
      {"name": "Criminal Burguer", "slug": "criminal-burguer", "categories": ["snacksBurgers"]},
      {"name": "IPo Bar & Restaurante", "slug": "ipo-bar-restaurante", "categories": ["barPub"]},
      {"name": "Le Jazz Boulangerie", "slug": "le-jazz-boulangerie", "categories": ["french","cafeBakeryDesserts"]},
      {"name": "Le Jazz Higienopolis", "slug": "le-jazz-higienopolis", "categories": ["french"]},
      {"name": "Le Jazz Iguatemi", "slug": "le-jazz-iguatemi", "categories": ["french"]},
      {"name": "Le Jazz Melo Alves", "slug": "le-jazz-melo-alves", "categories": ["french"]},
      {"name": "Le Jazz Petit", "slug": "le-jazz-petit", "categories": ["barPub","french"]},
      {"name": "Le Jazz Pinheiros", "slug": "le-jazz-pinheiros", "categories": ["french"]},
      {"name": "Leiteria Santa Clara", "slug": "leiteria-santa-clara", "categories": ["brazilian"]},
      {"name": "Little Boys Rock Bar", "slug": "little-boys-rock-bar", "categories": ["snacksBurgers"]},
      {"name": "Maracujá", "slug": "maracuja", "categories": ["brazilian","veganVegetarian"]},
      {"name": "Mica", "slug": "mica", "categories": ["other"]},
      {"name": "Panda LaPi", "slug": "panda-lapi", "categories": ["chinese"]},
      {"name": "Panda Ya!", "slug": "panda-ya", "categories": ["chinese"]},
      {"name": "Pita", "slug": "pita", "categories": ["arabic"]},
      {"name": "Pitico", "slug": "pitico", "categories": ["barPub","arabic"]},
      {"name": "Ripa na Xulipa", "slug": "ripa-na-xulipa", "categories": ["barbecueGrill"]},
      {"name": "Wanderlust", "slug": "wanderlust", "categories": ["italian","brazilian","international"]},
      {"name": "Yalinha", "slug": "yalinha", "categories": ["arabic"]}
    ],
    "belo-horizonte": [
      {"name": "All Mar", "slug": "all-mar", "categories": ["seafood"]},
      {"name": "Bar Du China", "slug": "bar-du-china", "categories": ["barPub"]},
      {"name": "Beji Sushi veg", "slug": "beji-sushi-veg", "categories": ["veganVegetarian"]},
      {"name": "Bendito Chopp", "slug": "bendito-chopp", "categories": ["barPub","brazilian"]},
      {"name": "Benjamin Bar & Parrilla", "slug": "benjamin-bar-parrilla", "categories": ["barPub","selfServiceBuffet","barbecueGrill","brazilian"]},
      {"name": "Brooklin Burger", "slug": "brooklin-burger", "categories": ["snacksBurgers"]},
      {"name": "Café das Amoras", "slug": "cafe-das-amoras", "categories": ["cafeBakeryDesserts"]},
      {"name": "Café Verly", "slug": "cafe-verly", "categories": ["cafeBakeryDesserts"]},
      {"name": "Canga & Candeia", "slug": "canga-candeia", "categories": ["brazilian","barPub"]},
      {"name": "Cantina Renata Castro BH", "slug": "cantina-renata-castro-bh", "categories": ["italian"]},
      {"name": "Casa Baanko", "slug": "casa-baanko", "categories": ["cafeBakeryDesserts","brazilian"]},
      {"name": "Casa Verona", "slug": "casa-verona", "categories": ["pizza","cafeBakeryDesserts"]},
      {"name": "Cervejaria Salute", "slug": "cervejaria-salute", "categories": ["barPub","mineiro"]},
      {"name": "Churras", "slug": "churras", "categories": ["barbecueGrill","snacksBurgers"]},
      {"name": "Colt Grill", "slug": "colt-grill", "categories": ["barPub","mineiro"]},
      {"name": "Comidaria Guerra", "slug": "comidaria-guerra", "categories": ["veganVegetarian"]},
      {"name": "Donna Ulisses", "slug": "donna-ulisses", "categories": ["pizza","barbecueGrill"]},
      {"name": "Frizza - Pizza Frita Napolitana", "slug": "frizza-pizza-frita-napolitana", "categories": ["pizza"]},
      {"name": "Gira Drinks", "slug": "gira-drinks", "categories": ["wineBar"]},
      {"name": "Gira Vinhos", "slug": "gira-vinhos", "categories": ["wineBar"]},
      {"name": "Go Growler SB", "slug": "go-growler-sb", "categories": ["barPub"]},
      {"name": "Indian Spice", "slug": "indian-spice", "categories": ["indian"]},
      {"name": "It's Surreal Fleming", "slug": "its-surreal-fleming", "categories": ["barPub","selfServiceBuffet"]},
      {"name": "It's Surreal Savassi", "slug": "its-surreal-savassi", "categories": ["barbecueGrill","barPub"]},
      {"name": "Japa Lourdes", "slug": "japa-lourdes", "categories": ["japanese"]},
      {"name": "John Jonh", "slug": "john-jonh", "categories": ["barPub"]},
      {"name": "Laicos Sapucaí", "slug": "laicos-sapucai", "categories": ["barPub"]},
      {"name": "Lu Ribeiro Haras", "slug": "lu-ribeiro-haras", "categories": ["mineiro","brazilian"]},
      {"name": "Magrí Palácio", "slug": "magri-palacio", "categories": ["cafeBakeryDesserts"]},
      {"name": "Metrópole Bistrô", "slug": "metropole-bistro", "categories": ["barPub","italian"]},
      {"name": "Morada Mexicana", "slug": "morada-mexicana", "categories": ["mexican"]},
      {"name": "Oop Café Centro", "slug": "oop-cafe-centro", "categories": ["cafeBakeryDesserts"]},
      {"name": "Oop Café Savassi", "slug": "oop-cafe-savassi", "categories": ["cafeBakeryDesserts","veganVegetarian"]},
      {"name": "Padilha Choperia", "slug": "padilha-choperia", "categories": ["barPub"]},
      {"name": "Parrilla Costello", "slug": "parrilla-costello", "categories": ["barbecueGrill","brazilian"]},
      {"name": "Passeli Boulangerie", "slug": "passeli-boulangerie", "categories": ["cafeBakeryDesserts","pizza"]},
      {"name": "Renegado Cervejaria", "slug": "renegado-cervejaria", "categories": ["barPub"]},
      {"name": "Roça Grande", "slug": "roca-grande", "categories": ["deliGourmet"]},
      {"name": "Sorvete Amigo", "slug": "sorvete-amigo", "categories": ["cafeBakeryDesserts","other"]},
      {"name": "Taverna Ficker", "slug": "taverna-ficker", "categories": ["barPub"]},
      {"name": "The Butcher", "slug": "the-butcher", "categories": ["barPub","barbecueGrill","brazilian"]},
      {"name": "The Mint", "slug": "the-mint", "categories": ["barPub"]},
      {"name": "The Road House", "slug": "the-road-house", "categories": ["barPub","mineiro"]},
      {"name": "Tua Pizza", "slug": "tua-pizza", "categories": ["pizza","italian"]},
      {"name": "Wa Savassi", "slug": "wa-savassi", "categories": ["japanese"]},
      {"name": "Wine Bar Casa Geraldo", "slug": "wine-bar-casa-geraldo", "categories": ["wineBar"]},
      {"name": "Xico do Golo Prado", "slug": "xico-do-golo-prado", "categories": ["barPub"]}
    ],
    "ouro-preto": [
      {"name": "Opera Café", "slug": "opera-cafe", "categories": ["cafeBakeryDesserts","deliGourmet"]}
    ],
    "brumadinho": [
      {"name": "OOP Café - Galeria True Rouge", "slug": "oop-cafe-galeria-true-rouge", "categories": ["cafeBakeryDesserts","veganVegetarian"]},
      {"name": "OOP Especialidades - Galeria Miguel Rio Branco", "slug": "oop-especialidades-galeria-miguel-rio-branco", "categories": ["cafeBakeryDesserts"]},
      {"name": "OOP Pocket - Galeria Fonte", "slug": "oop-pocket-galeria-fonte", "categories": ["cafeBakeryDesserts","brazilian"]},
      {"name": "OOP Raízes - Palm Pavilion", "slug": "oop-raizes-palm-pavilion", "categories": ["cafeBakeryDesserts","brazilian"]}
    ],
    "governador-valadares": [
      {"name": "Esquenta Butiquim", "slug": "esquenta-butiquim", "categories": ["barPub"]}
    ],
    "contagem": [
      {"name": "Boi Bravo", "slug": "boi-bravo", "categories": ["barbecueGrill"]},
      {"name": "Tio Chico Contagem", "slug": "tio-chico-contagem", "categories": ["barPub"]}
    ],
    "lagoa-santa": [
      {"name": "Karambas Pub", "slug": "karambas-pub", "categories": ["barPub","mexican"]}
    ],
    "estiva": [
      {"name": "Alto da Serra", "slug": "alto-da-serra", "categories": ["snacksBurgers","barbecueGrill"]}
    ]
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
  ];

  // Rotas de cidades e categorias
  for (const city of sitemapData.cities) {
    urls.push({ url: `${baseUrl}/restaurante/${city}`, lastModified: new Date() });
    const categories = sitemapData.cityCategories[city] || [];
    for (const cat of categories) {
      urls.push({ url: `${baseUrl}/restaurante/${city}/${cat}`, lastModified: new Date() });
    }
    // Restaurantes individuais
    const restaurants = sitemapData.restaurants[city] || [];
    for (const rest of restaurants) {
      urls.push({
        url: `${baseUrl}/restaurante/${city}/restaurante/${rest.slug}`,
        lastModified: new Date()
      });
    }
  }

  return urls;
}
