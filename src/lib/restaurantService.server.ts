import { db } from '@/lib/firebaseAdmin';

// Sanitização de dados do restaurante (mesmo do client)
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  categories: string[];
  [key: string]: any;
}

// Converte nome de cidade slug para display
function formatCitySlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');
}

// Gera slug a partir do nome
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getAllCities(): Promise<string[]> {
  // Fetch all places
  const snap = await db.collection('places').get();
  const slugs = new Set<string>();
  snap.docs.forEach((doc) => {
    const data = doc.data() as any;
    if (data.guideConfig?.isVisible) {
      const cityRaw = data.guideConfig.address?.city || data.city;
      if (cityRaw) {
        const slug = slugify(cityRaw);
        slugs.add(slug);
      }
    }
  });
  return Array.from(slugs);
}

export async function getRestaurantsByCity(citySlug: string): Promise<{ restaurants: Restaurant[] }> {
  const snap = await db.collection('places').get();
  const restaurants: Restaurant[] = [];
  snap.docs.forEach((doc) => {
    const data = doc.data() as any;
    if (!data.guideConfig?.isVisible) return;
    const address = data.guideConfig.address || {};
    const cityRaw = address.city || data.city || '';
    if (slugify(cityRaw) !== citySlug) return;
    const categories = Array.isArray(data.guideConfig.categories)
      ? data.guideConfig.categories
      : Array.isArray(data.categories)
      ? data.categories
      : [];
    const coords = address.coordinates
      ? { latitude: address.coordinates.latitude, longitude: address.coordinates.longitude }
      : null;
    restaurants.push({
      id: doc.id,
      name: data.name || '',
      slug: slugify(data.name || ''),
      categories,
      mainPhoto: data.mainPhoto || null,
      logo: data.logo || null,
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      addressDistrict: address.district || '',
      city: cityRaw,
      coordinates: coords,
    });
  });
  restaurants.sort((a, b) => a.name.localeCompare(b.name));
  return { restaurants };
}

export async function getRestaurantBySlug(cidade: string, nomeSlug: string): Promise<Restaurant | null> {
  const snap = await db.collection('places').get();
  for (const doc of snap.docs) {
    const data = doc.data() as any;
    if (!data.guideConfig?.isVisible) continue;
    // Ensure cityRaw is a string to avoid undefined
    const cityRaw = data.guideConfig.address?.city || data.city || '';
    if (slugify(cityRaw) !== cidade) continue;
    const slugName = slugify(data.name || '');
    if (slugName !== nomeSlug) continue;
    return { id: doc.id, ...data };
  }
  return null;
}
