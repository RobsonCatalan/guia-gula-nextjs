import RestaurantDetailClient from './client-component';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { 'nome-restaurante': string } }): Promise<Metadata> {
  const slug = params['nome-restaurante'];
  const name = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { title: `Restaurante ${name} | Gula.menu` };
}

export default function Page() {
  return <RestaurantDetailClient />;
}
