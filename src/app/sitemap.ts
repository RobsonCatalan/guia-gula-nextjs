import type { MetadataRoute } from 'next'
import { db } from '@/lib/firebaseAdmin'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'
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
  try {
    // Fetch all visible places once
    const snapshot = await db.collection('places').get()
    const docs = snapshot.docs.filter(d => d.data().guideConfig?.isVisible)

    // Group restaurants by city slug
    const cityMap: Record<string, { slug: string; categories: string[] }[]> = {}
    docs.forEach(d => {
      const data = d.data() as any
      const cityRaw = data.guideConfig?.address?.city || data.city || ''
      const citySlug = slugify(cityRaw)
      if (!cityMap[citySlug]) cityMap[citySlug] = []
      cityMap[citySlug].push({
        slug: slugify(data.name || ''),
        categories: Array.isArray(data.guideConfig?.categories)
          ? data.guideConfig.categories
          : [],
      })
    })

    // Start building URLs
    const urls: MetadataRoute.Sitemap = [{ url: `${baseUrl}/`, lastModified: new Date() }]

    for (const city of Object.keys(cityMap)) {
      urls.push({ url: `${baseUrl}/restaurante/${city}`, lastModified: new Date() })

      // Category pages for this city
      const codes = cityMap[city].flatMap(r => r.categories)
      const unique = Array.from(new Set(codes))
      unique.forEach(code => {
        const label = categoryMap[code] || code
        urls.push({ url: `${baseUrl}/restaurante/${city}/${slugify(label)}`, lastModified: new Date() })
      })

      // Individual restaurant pages
      cityMap[city].forEach(r => {
        urls.push({ url: `${baseUrl}/restaurante/${city}/restaurante/${r.slug}`, lastModified: new Date() })
      })
    }

    return urls
  } catch (error) {
    console.error('Failed to generate sitemap', error)
    return [{ url: `${baseUrl}/`, lastModified: new Date() }]
  }
}
