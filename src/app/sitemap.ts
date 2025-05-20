import type { MetadataRoute } from 'next';
import { getAllCities, getRestaurantsByCity } from '@/lib/restaurantService.server';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';
const baseUrl = 'https://gula.menu';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
  ];

  const cities = await getAllCities();
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
    other: 'Outros',
  };

  for (const city of cities) {
    // City root
    urls.push({ url: `${baseUrl}/restaurante/${city}`, lastModified: new Date() });
    const { restaurants } = await getRestaurantsByCity(city);

    // Category pages
    const codes = restaurants.flatMap(r => r.categories || []);
    const uniqueCodes = Array.from(new Set(codes));
    for (const code of uniqueCodes) {
      const label = categoryMap[code] || code;
      urls.push({ url: `${baseUrl}/restaurante/${city}/${slugify(label)}`, lastModified: new Date() });
    }

    // Individual restaurant pages
    for (const rest of restaurants) {
      urls.push({ url: `${baseUrl}/restaurante/${city}/restaurante/${rest.slug}`, lastModified: new Date() });
    }
  }

  return urls;
}
