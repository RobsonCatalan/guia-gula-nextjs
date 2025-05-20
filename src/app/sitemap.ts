import type { MetadataRoute } from 'next'
import { getAllCities, getRestaurantsByCity } from '@/lib/restaurantService.server'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-static'
export const revalidate = 3600
const baseUrl = 'https://gula.menu'

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
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [{ url: `${baseUrl}/`, lastModified: new Date() }]
  let cities: string[] = []
  try {
    cities = await getAllCities()
  } catch (error) {
    console.error('Error fetching cities for sitemap', error)
  }
  for (const city of cities) {
    urls.push({ url: `${baseUrl}/restaurante/${city}`, lastModified: new Date() })
    let restaurantsList: any[] = []
    try {
      const result = await getRestaurantsByCity(city)
      restaurantsList = result.restaurants
    } catch (error) {
      console.error('Error fetching restaurants for sitemap for city', city, error)
    }
    const codes = restaurantsList.flatMap(r => r.categories || [])
    const uniqueCodes = Array.from(new Set(codes))
    for (const code of uniqueCodes) {
      const label = categoryMap[code] || code
      urls.push({ url: `${baseUrl}/restaurante/${city}/${slugify(label)}`, lastModified: new Date() })
    }
    for (const rest of restaurantsList) {
      urls.push({ url: `${baseUrl}/restaurante/${city}/restaurante/${rest.slug}`, lastModified: new Date() })
    }
  }
  return urls
}
