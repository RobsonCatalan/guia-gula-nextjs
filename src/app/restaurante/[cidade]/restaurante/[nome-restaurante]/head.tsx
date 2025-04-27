import React from 'react';
// Removed NextHead import; using Fragment for head.tsx content
import { getRestaurantsByCity } from '@/lib/restaurantService';
import { slugify } from '@/lib/utils';
import { categoryMap } from '@/components/RestaurantCard';

type Props = { params: { cidade: string; 'nome-restaurante': string } };

export default async function Head({ params }: Props) {
  const { cidade, 'nome-restaurante': slug } = params;
  const { restaurants } = await getRestaurantsByCity(cidade);
  const restaurant = restaurants.find(r => slugify(r.name) === slug);

  const title = restaurant ? `Restaurante ${restaurant.name} | Gula.menu` : 'Restaurante | Gula.menu';
  const desc = restaurant
    ? `Restaurante de ${(restaurant.categories || []).map(code => categoryMap[code] || code).join(', ')} no bairro ${restaurant.addressDistrict} em ${restaurant.addressCity}/${restaurant.addressState}`
    : 'Encontre restaurantes no Gula.menu';
  const pageUrl = `https://www.gulamenu.com.br/restaurante/${cidade}/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: title,
    mainEntity: {
      '@type': 'Restaurant',
      '@id': `${pageUrl}#restaurant`,
      name: restaurant?.name,
      image: restaurant?.imageUrl,
      address: {
        '@type': 'PostalAddress',
        streetAddress: `${restaurant?.addressStreet} ${restaurant?.addressNumber}${restaurant?.addressComplement ? ', ' + restaurant.addressComplement : ''}`,
        addressLocality: restaurant?.addressCity,
        addressRegion: restaurant?.addressState,
        postalCode: restaurant?.postalCode,
        addressCountry: 'BR',
      },
      geo: restaurant?.coordinates
        ? { '@type': 'GeoCoordinates', latitude: restaurant.coordinates.latitude, longitude: restaurant.coordinates.longitude }
        : undefined,
      telephone: restaurant?.phone,
      url: pageUrl,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: restaurant?.rating ?? 0,
        reviewCount: restaurant?.reviewCount ?? 0,
      },
      openingHoursSpecification: restaurant?.workingHours?.map(({ weekday, startTime, endTime }) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][weekday - 1],
        opens: `${String(Math.floor(startTime/60)).padStart(2,'0')}:${String(startTime%60).padStart(2,'0')}`,
        closes: `${String(Math.floor(endTime/60)).padStart(2,'0')}:${String(endTime%60).padStart(2,'0')}`,
      })),
    },
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={restaurant?.mainPhoto || restaurant?.imageUrl || '/images/logo/logo.webp'} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
