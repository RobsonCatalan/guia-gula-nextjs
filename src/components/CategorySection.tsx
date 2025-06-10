import CategorySectionClient from './CategorySection.client';
import { getRestaurantsByCity } from '@/lib/restaurantService.server';

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

interface CategorySectionProps {
  city: string;
  title?: string;
  currentCategory?: string;
}

export default async function CategorySection({ city, title, currentCategory }: CategorySectionProps) {
  const { restaurants } = await getRestaurantsByCity(city);
  const codes = restaurants.flatMap(r => r.categories || []);
  const uniqueCodes = Array.from(new Set(codes));
  const categories = uniqueCodes.map(code => categoryMap[code] || code);

  return (
    <CategorySectionClient
      city={city}
      title={title}
      currentCategory={currentCategory}
      categories={categories}
    />
  );
}
