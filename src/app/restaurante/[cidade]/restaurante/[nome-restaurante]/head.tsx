import React from 'react';

type Props = { params: { cidade: string; 'nome-restaurante': string } };

export default function Head({ params }: Props) {
  const slug = params['nome-restaurante'];
  const name = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return (
    <>
      <title>{`Restaurante ${name} | Gula.menu`}</title>
    </>
  );
}
