import { getAllCities } from '@/lib/restaurantService.server';
import CitiesSectionClient from './CitiesSection.client';

interface CitiesSectionProps {
  currentCity?: string;
}

export default async function CitiesSection({ currentCity }: CitiesSectionProps) {
  const cities = await getAllCities();
  return <CitiesSectionClient cities={cities} currentCity={currentCity} />;
}