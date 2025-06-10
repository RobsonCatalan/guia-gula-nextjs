import { db } from '@/lib/firebaseAdmin';

export interface MenuItemServer {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  sectionName: string;
  appearanceOrder: number;
  sectionAppearanceOrder: number;
}

export interface MenuSection {
  name: string;
  items: MenuItemServer[];
}

export async function getMenuSections(placeId: string): Promise<MenuSection[]> {
  const placeRef = db.collection('places').doc(placeId);
  const q = db
    .collection('menuItems')
    .where('place', '==', placeRef)
    .where('isVisible', '==', true)
    .where('deleted', '==', false);
  const snap = await q.get();
  const items: MenuItemServer[] = snap.docs.map(docSnap => {
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      name: data.name || '',
      description: data.description || '',
      price: data.price || 0,
      image: data.shortImage || null,
      sectionName: data.sectionName || '',
      appearanceOrder: data.appearanceOrder || 0,
      sectionAppearanceOrder: data.sectionAppearanceOrder || 0,
    };
  });
  // Group into sections
  const map: Record<string, { name: string; sectionAppearanceOrder: number; items: MenuItemServer[] }> = {};
  items.forEach(item => {
    if (!map[item.sectionName]) {
      map[item.sectionName] = {
        name: item.sectionName,
        sectionAppearanceOrder: item.sectionAppearanceOrder,
        items: [],
      };
    }
    map[item.sectionName].items.push(item);
  });
  const sections = Object.values(map)
    .sort((a, b) => a.sectionAppearanceOrder - b.sectionAppearanceOrder)
    .map(section => ({
      name: section.name,
      items: section.items.sort((a, b) => a.appearanceOrder - b.appearanceOrder),
    }));
  return sections;
}
