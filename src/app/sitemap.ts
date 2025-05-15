import type { MetadataRoute } from 'next';
import { getAllCities, getRestaurantsByCity } from '@/lib/restaurantService';
import { slugify } from '@/lib/utils';

// Mapeamento de códigos para labels de categoria (Mesma definição usada no client)
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gula.menu';
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl + '/', lastModified: new Date() }
  ];

  // 1. rotas de cidades
  const cities = await getAllCities();
  for (const city of cities) {
    routes.push({ url: `${baseUrl}/restaurante/${city}`, lastModified: new Date() });

    // 2. rotas de categorias por cidade
    const { restaurants } = await getRestaurantsByCity(city);
    const categorySet = new Set<string>();
    restaurants.forEach(r => (r.categories || []).forEach(code => categorySet.add(code)));
    for (const code of categorySet) {
      const label = categoryMap[code] || code;
      const slug = slugify(label);
      routes.push({ url: `${baseUrl}/restaurante/${city}/${slug}`, lastModified: new Date() });
    }

    // 3. rotas de restaurantes por cidade
    for (const r of restaurants) {
      routes.push({
        url: `${baseUrl}/restaurante/${city}/restaurante/${slugify(r.name)}`,
        lastModified: new Date()
      });
    }
  }

  return routes;
}
