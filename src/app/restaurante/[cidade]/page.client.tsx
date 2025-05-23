'use client';

import ClientComponent from './client-component';
import type { Restaurant } from '@/lib/restaurantService';

interface CityPageClientProps {
  cidade: string;
  initialRestaurants: Restaurant[];
}

export default function CityPageClient({ cidade, initialRestaurants }: CityPageClientProps) {
  return <ClientComponent cidade={cidade} initialRestaurants={initialRestaurants} />;
}
