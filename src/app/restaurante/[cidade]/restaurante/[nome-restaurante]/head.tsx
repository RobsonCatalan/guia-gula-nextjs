import React from 'react';

type Props = { params: { cidade: string; 'nome-restaurante': string } };

export default function Head({ params }: Props) {
  const { cidade, 'nome-restaurante': slug } = params;

  const name = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const cityName = cidade
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const title = `Restaurante ${name} | Gula.menu`;
  const desc = `Conheça o Restaurante ${name} em ${cityName}`;
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
