export const dynamic = 'force-dynamic';
export const prerender = false;
import { getAllCities } from '@/lib/restaurantService.server';
import HomeClient from '@/components/HomeClient';

export default async function HomePage() {
  const initialCities = await getAllCities();
  return <HomeClient initialCities={initialCities} />;
}
