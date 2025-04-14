// src/components/RestaurantCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/lib/restaurantService';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const {
    id,
    name,
    logo,
    mainPhoto,
  } = restaurant;

  // Estado para controlar erros de carregamento de imagem
  const [mainPhotoError, setMainPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // URL para página do restaurante (simplificada por enquanto)
  const restaurantUrl = `/restaurante/${id}`;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Imagem principal do restaurante */}
      <div className="relative h-48 w-full bg-[#FFF8F0]">
        {mainPhoto && !mainPhotoError ? (
          <Image
            src={mainPhoto}
            alt={`Foto de ${name}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setMainPhotoError(true)}
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[#F4A261] flex items-center justify-center">
            <span className="text-white text-4xl font-bold">{name.charAt(0)}</span>
          </div>
        )}

        {/* Logo sobreposta no canto inferior direito */}
        {logo && !logoError && (
          <div className="absolute bottom-3 right-3 w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-white">
            <Image
              src={logo}
              alt={`Logo de ${name}`}
              fill
              className="object-contain"
              onError={() => setLogoError(true)}
              sizes="64px"
            />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold text-[#4A4A4A] mb-2 truncate">{name}</h3>
        
        <div className="flex justify-end mt-2">
          <Link 
            href={restaurantUrl}
            className="bg-[#D32F2F] text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Ver mais
          </Link>
        </div>
      </div>
    </div>
  );
}
