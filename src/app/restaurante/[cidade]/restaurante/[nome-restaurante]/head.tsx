import React from 'react';
import { getRestaurantsByCity } from '@/lib/restaurantService';
import { slugify } from '@/lib/utils';

type Props = { params: { cidade: string; 'nome-restaurante': string } };

export default async function Head({ params }: Props) {
  const { cidade, 'nome-restaurante': slug } = params;
  let restaurantName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');
  try {
    const { restaurants } = await getRestaurantsByCity(cidade);
    const found = restaurants.find(r => slugify(r.name) === slug);
    if (found) restaurantName = found.name;
  } catch (error) {
    console.error('Erro ao buscar restaurante no Head:', error);
  }
  const cityName = cidade
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');
  const title = `Restaurante ${restaurantName} | Gula.menu`;
  const desc = `Conheça o Restaurante ${restaurantName} em ${cityName}`;
  const pageUrl = `https://www.gulamenu.com.br/restaurante/${cidade}/${slug}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="/images/logo/logo.webp" />
    </>
  );
}
