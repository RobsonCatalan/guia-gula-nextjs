import type { Metadata } from 'next';
import RestaurantDetailClient from './client-component';
import { Suspense } from 'react';
import { getRestaurantsByCity, getRestaurantBySlug } from '@/lib/restaurantService.server';
import MenuSection from './menu-section.server'; // Import the new MenuSection component

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  // Await `params` before accessing properties
  const { cidade, ['nome-restaurante']: nomeSlug } = await params;
  // Format slugs for display
  const formatSlug = (slugVal: string): string =>
    slugVal
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/\bSao\b/g, 'São');
  const cidadeFormatada = formatSlug(cidade);
  const nomeFormatado = formatSlug(nomeSlug);
  return {
    title: `Restaurante ${nomeFormatado} em ${cidadeFormatada} | Gula.menu`,
    description: `${nomeFormatado}: Restaurante em ${cidadeFormatada}`,
    metadataBase: new URL('http://localhost:3001'),
  };
}

export default async function Page({ params }: { params: any }) {
  // Await `params` before accessing properties
  const { cidade, ['nome-restaurante']: nomeSlug } = await params;
  const restaurant = await getRestaurantBySlug(cidade, nomeSlug);
  if (!restaurant) {
    return <div className="text-center py-8 text-red-500">Restaurante não encontrado</div>;
  }
  // Flatten and sanitize restaurant data for client
  const raw = JSON.parse(JSON.stringify(restaurant));
  // Address fields
  const addressStreet = raw.guideConfig?.address?.street || '';
  const addressNumber = raw.guideConfig?.address?.number || '';
  const addressComplement = raw.guideConfig?.address?.complement || '';
  const addressDistrict = raw.guideConfig?.address?.district || '';
  const addressCity = raw.guideConfig?.address?.city || '';
  const addressState = raw.guideConfig?.address?.state || '';
  // Coordinates
  // Map Firestore GeoPoint to plain object
  const coordRaw: any = raw.guideConfig?.address?.coordinates;
  const coordinates = coordRaw
    ? {
        latitude: coordRaw.latitude ?? coordRaw._latitude ?? 0,
        longitude: coordRaw.longitude ?? coordRaw._longitude ?? 0,
      }
    : null;
  // Working hours
  const workingHours = Array.isArray(raw.guideConfig?.workingHours)
    ? raw.guideConfig.workingHours.map((wh: any) => ({ weekday: wh.weekday, startTime: wh.startTime, endTime: wh.endTime }))
    : [];
  // Delivery config & hours
  const deliveryWorkingHours = Array.isArray(raw.deliveryConfig?.workingHours)
    ? raw.deliveryConfig.workingHours.map((wh: any) => ({ weekday: wh.weekday, startTime: wh.startTime, endTime: wh.endTime }))
    : [];
  const deliveryConfig = { ...raw.deliveryConfig, workingHours: deliveryWorkingHours };
  const {
    id,
    name,
    slug,
    mainPhoto = null,
    mainMenuShowcaseImages = [],
    welcomeScreenImages = [],
    logo = null,
    rating = 0,
    reviewCount = 0,
    description = '',
    shortDescription = '',
    instagramLink = '',
  } = raw;
  const categories = raw.guideConfig?.categories ?? raw.categories ?? [];
  const restaurantData = {
    id,
    name,
    slug,
    categories,
    mainPhoto,
    mainMenuShowcaseImages,
    welcomeScreenImages,
    logo,
    rating,
    reviewCount,
    description,
    shortDescription,
    instagramLink,
    addressStreet,
    addressNumber,
    addressComplement,
    addressDistrict,
    addressCity,
    addressState,
    coordinates,
    workingHours,
    deliveryConfig,
  };
  return (
    <Suspense fallback={<p className="text-center py-8">Carregando detalhes...</p>}>
      <RestaurantDetailClient restaurant={restaurantData} />
      <MenuSection placeId={restaurantData.id} />
    </Suspense>
  );
}
