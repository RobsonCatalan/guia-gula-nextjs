import type { Metadata } from 'next';
import RestaurantDetailClient from './client-component';

export async function generateMetadata({ params }: { params: { cidade: string; 'nome-restaurante': string } }): Promise<Metadata> {
  const slugParam = params['nome-restaurante'];
  const restaurantName = slugParam
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');
  return { title: `Restaurante ${restaurantName} | Gula.menu` };
}

export default function Page() {
  return <RestaurantDetailClient />;
}
