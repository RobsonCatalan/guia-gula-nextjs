// src/components/RestaurantCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/lib/restaurantService';

// Função para converter texto em formato slug para URL
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais exceto espaços e hífens
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim() // Remove espaços no início e fim
    .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
};

interface RestaurantCardProps {
  restaurant: Restaurant;
}

// Map English category codes to Portuguese labels
export const categoryMap: Record<string, string> = {
  barPub: 'Bar & Pub',
  pizza: 'Pizzaria',
  cafeBakeryDesserts: 'Café & Pães & Doces',
  snacksBurgers: 'Lanches & Burgers',
  barbecueGrill: 'Churrasco & Grelhados',
  pastryShop: 'Pastelaria',
  japanese: 'Japonês',
  italian: 'Italiano',
  mineiro: 'Mineiro',
  arabic: 'Árabe',
  selfServiceBuffet: 'Self-service & Buffet',
  seafood: 'Frutos do Mar',
  mexican: 'Mexicano',
  wineBar: 'Wine Bar',
  chinese: 'Chinês',
  portuguese: 'Português',
  veganVegetarian: 'Vegano & Vegetariano',
  brazilian: 'Brasileiro',
  french: 'Francês',
  peruvian: 'Peruano',
  spanish: 'Espanhol',
  german: 'Alemão',
  indian: 'Indiano',
  international: 'Internacional',
  healthyJuices: 'Saudável & Sucos',
  beachKiosk: 'Quiosques & Barracas',
  deliGourmet: 'Empório & Delicatessen',
  other: 'Outros'
};

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const {
    id,
    name,
    logo,
    mainPhoto,
    city,
    rating,
    categories = [],
    reviewCount = 0
  } = restaurant;

  // Estado para controlar erros de carregamento de imagem
  const [mainPhotoError, setMainPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // URL para página do restaurante seguindo o formato /restaurante/[cidade]/restaurante/[nome-restaurante]
  const restaurantUrl = city
    ? `/restaurante/${createSlug(city)}/restaurante/${createSlug(name)}`
    : `/restaurante/${createSlug(name)}`;

  // Helper to render 5 stars with partial fill based on rating
  const renderStars = (ratingValue: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const fill = Math.max(0, Math.min(1, ratingValue - i));
      stars.push(
        <span key={i} className="relative inline-block w-4 h-4 mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.165 3.584a1 1 0 00.95.69h3.768c.969 0 1.371 1.24.588 1.81l-3.047 2.213a1 1 0 00-.364 1.118l1.165 3.584c.3.921-.755 1.688-1.538 1.118l-3.047-2.213a1 1 0 00-1.176 0l-3.047 2.213c-.783.57-1.838-.197-1.538-1.118l1.165-3.584a1 1 0 00-.364-1.118L2.575 9.011c-.783-.57-.38-1.81.588-1.81h3.768a1 1 0 00.95-.69l1.165-3.584z" />
          </svg>
          {fill > 0 && (
            <span className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#F4A261]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.165 3.584a1 1 0 00.95.69h3.768c.969 0 1.371 1.24.588 1.81l-3.047 2.213a1 1 0 00-.364 1.118l1.165 3.584c.3.921-.755 1.688-1.538 1.118l-3.047-2.213a1 1 0 00-1.176 0l-3.047 2.213c-.783.57-1.838-.197-1.538-1.118l1.165-3.584a1 1 0 00-.364-1.118L2.575 9.011c-.783-.57-.38-1.81.588-1.81h3.768a1 1 0 00.95-.69l1.165-3.584z" />
              </svg>
            </span>
          )}
        </span>
      );
    }
    return stars;
  };

  // Determine open state based on workingHours and deliveryConfig
  const now = new Date();
  const jsDay = now.getDay();
  const weekday = jsDay === 0 ? 7 : jsDay;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const presentialOpen = restaurant.workingHours?.some(wh => {
    const start = wh.startTime;
    const end = wh.endTime;
    if (start < end) {
      return wh.weekday === weekday && minutes >= start && minutes < end;
    }
    const nextDay = wh.weekday % 7 + 1;
    return (wh.weekday === weekday && minutes >= start) || (nextDay === weekday && minutes < end);
  }) ?? false;
  const onlineOpen = restaurant.deliveryConfig?.openNow ?? false;

  return (
    <div id={`restaurant-${createSlug(name)}`} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
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
        
        {rating && rating > 0 ? (
          <div className="flex items-center mb-2">
            {renderStars(rating)}
            <span className="ml-1 text-sm text-[#4A4A4A]">{rating.toFixed(1)} ({reviewCount} avaliações)</span>
          </div>
        ) : (
          <p className="text-sm text-[#4A4A4A] mb-2">Sem avaliações</p>
        )}
        
        <div className="text-sm mb-2">
          <span className="font-medium text-[#4A4A4A]">Presencial: </span>
          <span className={presentialOpen ? 'text-green-600' : 'text-red-600'}>
            {presentialOpen ? 'Aberto agora' : 'Fechado agora'}
          </span>
        </div>

        {restaurant.deliveryConfig?.enabled && (
          <div className="text-sm mb-2">
            <span className="font-medium text-[#4A4A4A]">Online: </span>
            <span className={onlineOpen ? 'text-green-600' : 'text-red-600'}>
              {onlineOpen ? 'Aberto agora' : 'Fechado agora'}
            </span>
          </div>
        )}
        
        {city && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{city}</span>
          </div>
        )}
        
        {/* Categories tags */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map(code => (
              <span key={code} className="bg-[#F4A261] text-white text-xs px-2 py-1 rounded">
                {categoryMap[code] || code}
              </span>
            ))}
          </div>
        )}
        
        {/* Delivery & Takeout icons */}
        {restaurant.deliveryConfig?.enabled && (
          <div className="flex items-center mb-2">
            {/* Takeout icon */}
            {!restaurant.deliveryConfig?.takeoutDisabled && (
              <Image
                src="/images/icons/takeout-gray.svg"
                alt="Retirada disponível"
                width={24}
                height={24}
                className="mr-2"
                unoptimized
              />
            )}
            {/* Delivery icon */}
            {!restaurant.deliveryConfig?.deliveryDisabled && (
              <Image
                src="/images/icons/delivery-gray.svg"
                alt="Delivery disponível"
                width={24}
                height={24}
                unoptimized
              />
            )}
          </div>
        )}
        
        <div className="flex justify-end mt-2">
          <Link
            href={restaurantUrl}
            className="bg-[#D32F2F] !text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Ver mais
          </Link>
        </div>
      </div>
    </div>
  );
}
