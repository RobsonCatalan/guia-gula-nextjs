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
    city,
  } = restaurant;

  // Estado para controlar erros de carregamento de imagem
  const [mainPhotoError, setMainPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // URL para página do restaurante seguindo o formato /{cidade}/restaurante/{nome-restaurante}
  const restaurantUrl = city 
    ? `/${city.toLowerCase().replace(/\s+/g, '-')}/restaurante/${name.toLowerCase().replace(/\s+/g, '-')}` 
    : `/restaurante/${name.toLowerCase().replace(/\s+/g, '-')}`; // Fallback caso não tenha cidade

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
        <h3 className="text-xl font-bold text-[#4A4A4A] mb-1 truncate">{name}</h3>
        
        {city && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{city}</span>
          </div>
        )}
        
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
