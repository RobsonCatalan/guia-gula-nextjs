import React from 'react';
import { getRestaurantsByCity } from '@/lib/restaurantService.server';
import { slugify } from '@/lib/utils';

type Props = { params: { cidade: string; 'nome-restaurante': string } };

export default async function Head({ params }: Props) {
  const { cidade, 'nome-restaurante': slug } = params;
  let restaurantName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');
  let categories: string[] = [];
  let breadcrumbLd: any = {};
  let restaurantLd: any = {};
  try {
    const { restaurants } = await getRestaurantsByCity(cidade);
    const found = restaurants.find(r => slugify(r.name) === slug);
    if (found) restaurantName = found.name;
    if (found) categories = found.categories || [];

    // JSON-LD construction
    const cidadeFormatada = cidade
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/\bSao\b/g, 'São');
    const pageUrl = `https://www.gulamenu.com.br/restaurante/${cidade}/${slug}`;
    breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://www.gulamenu.com.br/" },
        { "@type": "ListItem", "position": 2, "name": cidadeFormatada, "item": `https://www.gulamenu.com.br/restaurante/${cidade}` },
        { "@type": "ListItem", "position": 3, "name": restaurantName, "item": pageUrl }
      ]
    };
    restaurantLd = found ? {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": restaurantName,
      "image": pageUrl + found.mainPhoto,
      "telephone": found.deliveryConfig?.contactNumber || found.phone || '',
      "address": {
        "@type": "PostalAddress",
        "streetAddress": `${found.addressStreet || ''}${found.addressNumber ? `, ${found.addressNumber}` : ''}`,
        "addressLocality": found.addressCity || '',
        "addressRegion": found.addressState || '',
        "postalCode": found.postalCode || '',
        "addressCountry": "BR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": found.coordinates?.latitude,
        "longitude": found.coordinates?.longitude
      },
      "aggregateRating": found.rating ? { "@type": "AggregateRating", "ratingValue": found.rating, "reviewCount": found.reviewCount || 0 } : undefined,
      "servesCuisine": found.cuisine || ''
    } : {};
  } catch (error) {
    console.error('Erro ao buscar restaurante no Head:', error);
  }
  const cityName = cidade
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');
  const title = `Restaurante ${restaurantName} | Gula.menu`;
  const desc = `${restaurantName}: Restaurante de ${categories.join(', ')} em ${cityName}`;
  const pageUrl = `https://www.gulamenu.com.br/restaurante/${cidade}/${slug}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="/images/logo/logo.webp" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd, restaurantLd]) }}
      />
    </>
  );
}
