'use client';

import dynamic from 'next/dynamic';
import { slugify } from '@/lib/utils';
import type { RestaurantListProps } from '@/components/RestaurantList';

const CityDetector = dynamic(() => import('@/components/CityDetector'), { ssr: false });
const RestaurantList = dynamic<RestaurantListProps>(() => import('@/components/RestaurantList'), { ssr: false });

interface HomeInteractiveProps {
  city: string;
}

export default function HomeInteractive({ city }: HomeInteractiveProps) {
  return (
    <>
      <CityDetector
        onCityDetected={(cityName) => {
          const slug = slugify(cityName);
          document.cookie = `selectedCity=${slug}; path=/; max-age=2592000`;
          window.location.reload();
        }}
      />
      <RestaurantList city={city} />
    </>
  );
}
