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
  try {
    const snap = await db.collection('places').get();
    const slugs = new Set<string>();
    snap.docs.forEach((doc) => {
      const data = doc.data() as any;
      if (data.guideConfig?.isVisible) {
        const cityRaw = data.guideConfig.address?.city || data.city;
        if (cityRaw) {
          slugs.add(slugify(cityRaw));
        }
      }
    });
    return Array.from(slugs);
  } catch (err) {
    console.error('Error in getAllCities:', err);
    return [];
  }
}

export async function getAllStates(): Promise<string[]> {
  try {
    const snap = await db.collection('places').get();
    const stateCityMap = new Map<string, Set<string>>();
    snap.docs.forEach((doc) => {
      const data = doc.data() as any;
      // only include restaurants explicitly marked visible
      if (data.guideConfig?.isVisible !== true) return;
      const stateRaw = data.guideConfig?.address?.state || data.state;
      const cityRaw = data.guideConfig?.address?.city || data.city;
      if (!stateRaw || !cityRaw) return;
      const stateSlug = slugify(stateRaw);
      const citySlug = slugify(cityRaw);
      if (!stateCityMap.has(stateSlug)) stateCityMap.set(stateSlug, new Set());
      stateCityMap.get(stateSlug)!.add(citySlug);
    });
    return Array.from(stateCityMap.keys());
  } catch (err) {
    console.error('Error in getAllStates:', err);
    return [];
  }
}

export async function getCitiesByState(stateSlug: string): Promise<string[]> {
  try {
    const snap = await db.collection('places').get();
    const slugs = new Set<string>();
    snap.docs.forEach((doc) => {
      const data = doc.data() as any;
      // only include restaurants explicitly marked visible
      if (data.guideConfig?.isVisible !== true) return;
      const stateRaw = data.guideConfig?.address?.state || data.state;
      if (!stateRaw) return;
      if (slugify(stateRaw) !== stateSlug) return;
      const cityRaw = data.guideConfig.address?.city || data.city;
      if (cityRaw) {
        slugs.add(slugify(cityRaw));
      }
    });
    // Return unique city slugs for this state (only from visible restaurants)
    return Array.from(slugs).sort();
  } catch (err) {
    console.error('Error in getCitiesByState for', stateSlug, err);
    return [];
  }
}

export async function getRestaurantsByCity(citySlug: string): Promise<{ restaurants: Restaurant[] }> {
  try {
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
  } catch (err) {
    console.error('Error in getRestaurantsByCity for', citySlug, err);
    return { restaurants: [] };
  }
}

export async function getRestaurantBySlug(cidade: string, nomeSlug: string): Promise<Restaurant | null> {
  try {
    const snap = await db.collection('places').get();
    for (const doc of snap.docs) {
      const data = doc.data() as any;
      if (!data.guideConfig?.isVisible) continue;
      const cityRaw = data.guideConfig.address?.city || data.city || '';
      if (slugify(cityRaw) !== cidade) continue;
      if (slugify(data.name || '') !== nomeSlug) continue;
      return { id: doc.id, ...data };
    }
    return null;
  } catch (err) {
    console.error('Error in getRestaurantBySlug for', cidade, nomeSlug, err);
    return null;
  }
}
