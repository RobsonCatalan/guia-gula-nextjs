import RestaurantDetailClient from './client-component';
import type { Metadata } from 'next';
type Props = { params: { cidade: string; 'nome-restaurante': string } };
import { getRestaurantsByCity } from '@/lib/restaurantService';
import { slugify } from '@/lib/utils';
import { categoryMap } from '@/components/RestaurantCard';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade, 'nome-restaurante': slug } = params;
  const { restaurants } = await getRestaurantsByCity(cidade);
  const restaurant = restaurants.find(r => slugify(r.name) === slug);
  const title = restaurant ? `Restaurante ${restaurant.name} | Gula.menu` : 'Restaurante | Gula.menu';
  const description = restaurant
    ? `Restaurante de ${(restaurant.categories || []).map(code => categoryMap[code] || code).join(', ')} no bairro ${restaurant.addressDistrict} em ${restaurant.addressCity}/${restaurant.addressState}`
    : 'Encontre restaurantes no Gula.menu';
  return { title, description };
}

export default function Page() {
  return <RestaurantDetailClient />;
}
