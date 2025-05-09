import Link from 'next/link';
import Image from 'next/image';
import { getRestaurantsByCity } from '@/lib/restaurantService';

export const revalidate = 3600; // 1h cache

const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

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

interface CategoriesListProps {
  city: string;
  currentCategory?: string;
  title?: string;
}

export default async function CategoriesList({ city, currentCategory, title }: CategoriesListProps) {
  const { restaurants } = await getRestaurantsByCity(city);
  const codes = restaurants.flatMap(r => r.categories || []);
  const uniqueCodes = Array.from(new Set(codes));
  const filtered = currentCategory
    ? uniqueCodes.filter(code => code !== currentCategory)
    : uniqueCodes;

  return (
    <section className="py-6 px-6 bg-[#FFF8F0]">
      {title && <h2 className="text-3xl font-bold text-[#4A4A4A] mb-6">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map(code => {
          const label = categoryMap[code] || code;
          const slug = slugify(label);
          const imageSlug = code === 'pastryShop' ? 'pastel' : code === 'other' ? 'outros' : slug;
          return (
            <Link
              key={code}
              href={`/restaurante/${city}/${slug}`}
              className="flex flex-col items-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="relative w-full h-24">
                <Image
                  src={`/images/categories/${imageSlug}.webp`}
                  alt={label}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-[#FF5842] text-sm font-medium block text-center p-3">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
