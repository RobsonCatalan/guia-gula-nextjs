'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Restaurant, getRestaurantsByCity, getRestaurantReviews, Review } from '@/lib/restaurantService';
import Image from 'next/image';
import Link from 'next/link';
import ReviewsDrawer from '@/components/ReviewsDrawer';
import { categoryMap } from '@/components/RestaurantCard';
import Head from 'next/head';

// Gera slug a partir do texto
const slugify = (str: string): string =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

// Formata slug de cidade para exibição
const formatSlug = (slug: string): string =>
  slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');

// Mapeamento de weekday para nome em PT
const weekdayNames: Record<number, string> = {
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
  7: 'Domingo',
};

// Converte minutos após meia-noite para HH:MM
const formatTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

// Junta itens com vírgula e ' e ' antes do último item
const joinWithAnd = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} e ${items[1]}`;
  return items.slice(0, -1).join(', ') + ' e ' + items[items.length - 1];
};

// Agrupa horários com mesmo intervalo para exibir dias juntos
const groupWorkingHours = (hours: { weekday: number; startTime: number; endTime: number }[]) => {
  const map: Record<string, { days: number[]; startTime: number; endTime: number }> = {};
  hours.forEach(({ weekday, startTime, endTime }) => {
    const key = `${startTime}-${endTime}`;
    if (!map[key]) map[key] = { days: [], startTime, endTime };
    map[key].days.push(weekday);
  });
  return Object.values(map);
};

export default function RestaurantDetailClient() {
  const params = useParams();
  const cidade = params.cidade as string;
  const slug = params['nome-restaurante'] as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsDrawerOpen, setIsReviewsDrawerOpen] = useState(false);
  const [isPresentialOpen, setIsPresentialOpen] = useState(false);
  const [isOnlineOpen, setIsOnlineOpen] = useState(false);
  const openReviewsDrawer = () => { setIsReviewsDrawerOpen(true); document.body.style.overflow = 'hidden'; };
  const closeReviewsDrawer = () => { setIsReviewsDrawerOpen(false); document.body.style.overflow = 'auto'; };
  // Accordion state for working hours
  const [showPresentialHours, setShowPresentialHours] = useState(false);
  const [showOnlineHours, setShowOnlineHours] = useState(false);

  // Hide layout if version=restaurant param
  const searchParams = useSearchParams();
  const hideLayout = searchParams.get('version') === 'restaurant';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { restaurants } = await getRestaurantsByCity(cidade);
        const found = restaurants.find(r => slugify(r.name) === slug);
        if (!found) {
          setError('Restaurante não encontrado');
        } else {
          setRestaurant(found);
        }
      } catch (err) {
        console.error('Erro ao carregar restaurante:', err);
        setError('Erro ao carregar restaurante');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cidade, slug]);

  useEffect(() => {
    if (!restaurant) return;
    getRestaurantReviews(restaurant.id)
      .then(setReviews)
      .catch(console.error);
  }, [restaurant]);

  useEffect(() => {
    if (restaurant) {
      document.title = `Restaurante ${restaurant.name}`;
    }
  }, [restaurant]);

  useEffect(() => {
    if (restaurant) {
      const categoryLabels = (restaurant.categories || [])
        .map(code => categoryMap[code] || code)
        .join(', ');
      const district = restaurant.addressDistrict || '';
      const city = restaurant.addressCity || '';
      const state = restaurant.addressState || '';
      const desc = `Restaurante de ${categoryLabels} no bairro ${district} em ${city}/${state}`;
      let meta: HTMLMetaElement | null = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', desc);
      } else {
        meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = desc;
        document.head.appendChild(meta);
      }
    }
  }, [restaurant]);

  useEffect(() => {
    if (!restaurant) return;
    const now = new Date();
    const jsDay = now.getDay();
    const weekday = jsDay === 0 ? 7 : jsDay;
    const minutes = now.getHours() * 60 + now.getMinutes();
    // Revised open/closed logic with overnight handling
    const presentialOpen = restaurant.workingHours?.some(wh => {
      const start = wh.startTime;
      const end = wh.endTime;
      if (start < end) {
        return wh.weekday === weekday && minutes >= start && minutes < end;
      } else {
        const nextDay = wh.weekday % 7 + 1;
        return (wh.weekday === weekday && minutes >= start) || (nextDay === weekday && minutes < end);
      }
    }) ?? false;
    setIsPresentialOpen(presentialOpen);
    const onlineOpen = restaurant.deliveryConfig?.workingHours?.some(wh => {
      const start = wh.startTime;
      const end = wh.endTime;
      if (start < end) {
        return wh.weekday === weekday && minutes >= start && minutes < end;
      } else {
        const nextDay = wh.weekday % 7 + 1;
        return (wh.weekday === weekday && minutes >= start) || (nextDay === weekday && minutes < end);
      }
    }) ?? false;
    setIsOnlineOpen(onlineOpen);
  }, [restaurant]);

  // Highlight current day's hours in bold
  const nowForHighlight = new Date();
  const jsDayForHighlight = nowForHighlight.getDay();
  const todayWeekday = jsDayForHighlight === 0 ? 7 : jsDayForHighlight;

  // Prepara grupos de horários
  const presentialGroups = restaurant?.workingHours ? groupWorkingHours(restaurant.workingHours) : [];
  const onlineGroups = restaurant?.deliveryConfig?.workingHours ? groupWorkingHours(restaurant.deliveryConfig.workingHours) : [];

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-12 h-12 border-4 border-[#F4A261] border-t-[#D32F2F] rounded-full animate-spin"></div></div>;
  }
  if (error || !restaurant) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  const renderStars = (ratingValue: number) => {
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      const fill = Math.max(0, Math.min(1, ratingValue - i));
      stars.push(
        <span key={i} className="relative inline-block w-4 h-4 mr-1">
          {/* Base empty star */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.165 3.584a1 1 0 00.95.69h3.768c.969 0 1.371 1.24.588 1.81l-3.047 2.213a1 1 0 00-.364 1.118l1.165 3.584c.3.921-.755 1.688-1.538 1.118l-3.047-2.213a1 1 0 00-1.176 0l-3.047 2.213c-.783.57-1.838-.197-1.538-1.118l1.165-3.584a1 1 0 00-.364-1.118L2.575 9.011c-.783-.57-.38-1.81.588-1.81h3.768a1 1 0 00.95-.69l1.165-3.584z" />
          </svg>
          {/* Colored overlay clipped by width */}
          <span className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#F4A261]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.165 3.584a1 1 0 00.95.69h3.768c.969 0 1.371 1.24.588 1.81l-3.047 2.213a1 1 0 00-.364 1.118l1.165 3.584c.3.921-.755 1.688-1.538 1.118l-3.047-2.213a1 1 0 00-1.176 0l-3.047 2.213c-.783.57-1.838-.197-1.538-1.118l1.165-3.584a1 1 0 00-.364-1.118L2.575 9.011c-.783-.57-.38-1.81.588-1.81h3.768a1 1 0 00.95-.69l1.165-3.584z" />
            </svg>
          </span>
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="bg-[#FFF8F0]">
      {restaurant && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Restaurant',
                name: restaurant.name,
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: restaurant.rating || 0,
                  reviewCount: restaurant.reviewCount || 0,
                },
              }),
            }}
          />
        </Head>
      )}
      {!hideLayout && (
        <header className="bg-[#FF5842] text-white p-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/">
              <Image
                src="/images/logo/logo.webp"
                alt="Gula.menu"
                width={150}
                height={50}
                priority
                style={{ width: 'auto', height: 'auto' }}
              />
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="!text-white hover:text-[#FFF8F0] font-medium">Início</Link>
              <Link
                href={`/restaurante/${cidade}`}
                className="!text-white hover:text-[#FFF8F0] font-medium"
              >Restaurantes</Link>
            </nav>
            <button className="md:hidden text-2xl text-white">☰</button>
          </div>
        </header>
      )}
      {!hideLayout && (
        <nav className="max-w-7xl mx-auto px-6 py-2 text-sm text-[#4A4A4A]" aria-label="breadcrumb">
          <ol className="list-none flex">
            <li><Link href="/" className="hover:underline">Início</Link><span className="mx-2">/</span></li>
            <li><Link href={`/restaurante/${cidade}`} className="hover:underline">Restaurantes</Link><span className="mx-2">/</span></li>
            <li className="font-medium">{restaurant.name}</li>
          </ol>
        </nav>
      )}
      <section className="text-white py-16 bg-gradient-to-b from-[#FF7A68] to-[#FFF8F0]">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Roboto']">Restaurante {restaurant.name}</h1>
          {restaurant.mainPhoto && (
            <Image
              src={restaurant.mainPhoto}
              alt={restaurant.name}
              width={800}
              height={400}
              className="object-cover w-full h-64 rounded-lg"
              priority
            />
          )}
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-6 py-4">
        {restaurant.shortDescription && (
          <p className="text-base text-[#4A4A4A] mb-4">
            {restaurant.shortDescription}
          </p>
        )}
        {restaurant.categories && restaurant.categories.length > 0 && (
          <div className="mb-4">
            <span className="font-semibold text-[#4A4A4A] mr-2">Culinária:</span>
            <div className="flex flex-wrap gap-2">
              {restaurant.categories.map(code => (
                <h2 key={code} className="inline-block m-0 !text-xs !font-normal !leading-none bg-[#F4A261] text-white px-2 py-1 rounded">
                  {categoryMap[code] || code}
                </h2>
              ))}
            </div>
          </div>
        )}
        <div className="mb-2">
          <span className="font-semibold text-[#4A4A4A]">Avaliações:</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xl font-bold text-[#4A4A4A]">{restaurant?.rating?.toFixed(1)}</span>
          <div className="flex">{renderStars(restaurant?.rating || 0)}</div>
          <button onClick={openReviewsDrawer} className="text-[#FF5842] hover:underline ml-2">{restaurant?.reviewCount} avaliações</button>
        </div>
        {restaurant.instagramLink && (
          <div className="mb-4">
            <div className="mb-2">
              <span className="font-semibold text-[#4A4A4A]">Redes Sociais:</span>
            </div>
            <a href={`https://www.instagram.com/${restaurant.instagramLink}/`} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#FF5842] hover:underline mb-4">
              <Image src="/images/logo/instagram.jpg" alt="Instagram Logo" width={24} height={24} unoptimized />
              <span className="ml-2">Instagram</span>
            </a>
          </div>
        )}
        <ReviewsDrawer
          reviews={reviews}
          isOpen={isReviewsDrawerOpen}
          onClose={closeReviewsDrawer}
          rating={restaurant?.rating || 0}
          reviewCount={restaurant?.reviewCount || 0}
          restaurantName={restaurant?.name || ''}
        />
      </div>
      <main className="max-w-7xl mx-auto px-6 py-12 bg-[#FFF8F0]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ir ao Restaurante Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 text-[#4A4A4A]">Ir ao Restaurante</h3>
            <div className="flex items-center mb-4">
              <span className={`font-medium ${isPresentialOpen ? 'text-green-600' : 'text-red-600'}`}>{isPresentialOpen ? 'Aberto agora' : 'Fechado agora'}</span>
              <span className="mx-2 text-[#4A4A4A]">|</span>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowPresentialHours(p => !p); }} className="flex items-center !text-[#4A4A4A] !font-bold !underline !decoration-[#4A4A4A] hover:!text-[#4A4A4A] hover:!underline">
                <span>Horário de funcionamento</span>
                <span className="ml-1">{showPresentialHours ? '▲' : '▼'}</span>
              </a>
            </div>
            {showPresentialHours && (
              <ul className="list-disc list-inside text-[#4A4A4A] mb-4">
                {presentialGroups.map((group, i) => (
                  <li key={i} className={group.days.includes(todayWeekday) ? 'font-bold' : ''}>
                    {joinWithAnd(group.days.map(d => weekdayNames[d]))}: {formatTime(group.startTime)} - {formatTime(group.endTime)}
                  </li>
                ))}
              </ul>
            )}
            {restaurant.coordinates && (
              <div className="flex space-x-4 mb-4">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#FF5842] hover:underline">
                  <Image src="/images/logo/google-maps.png" alt="Google Maps Logo" width={24} height={24} unoptimized />
                  <span className="ml-2">Google Maps</span>
                </a>
                <a href={`https://www.waze.com/ul?ll=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#FF5842] hover:underline">
                  <Image src="/images/logo/waze.png" alt="Waze Logo" width={24} height={24} unoptimized />
                  <span className="ml-2">Waze</span>
                </a>
              </div>
            )}
            <p className="text-[#4A4A4A] mb-4"><strong>Endereço Completo:</strong> {restaurant.address}</p>
            <p className="text-[#4A4A4A] mb-2"><strong>Rua:</strong> {restaurant.addressStreet}, {restaurant.addressNumber}{restaurant.addressComplement && `, ${restaurant.addressComplement}`}</p>
            <p className="text-[#4A4A4A] mb-2"><strong>Bairro:</strong> {restaurant.addressDistrict}</p>
            <p className="text-[#4A4A4A] mb-2"><strong>Cidade:</strong> {restaurant.addressCity} - {restaurant.addressState}</p>
            <p className="text-[#4A4A4A] mb-4"><strong>CEP:</strong> {restaurant.postalCode}</p>
            <a href={`https://app.gula.menu/mainMenu?pPlace=${restaurant.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center mb-4 text-[#FF5842] hover:underline">
              <div style={{ WebkitMaskImage: `url('/images/icons/menu.png')`, maskImage: `url('/images/icons/menu.png')`, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain', backgroundColor: '#FF5842', width: '24px', height: '24px' }} />
              <span className="ml-2">Veja o cardápio</span>
            </a>
          </div>
          {/* Peça Online Card (se delivery habilitado) */}
          {restaurant.deliveryConfig?.enabled && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4 text-[#4A4A4A]">Pedir Online</h3>
              <div className="flex items-center mb-4">
                <span className={`font-medium ${isOnlineOpen ? 'text-green-600' : 'text-red-600'}`}>{isOnlineOpen ? 'Aberto agora' : 'Fechado agora'}</span>
                <span className="mx-2 text-[#4A4A4A]">|</span>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowOnlineHours(p => !p); }} className="flex items-center !text-[#4A4A4A] !font-bold !underline !decoration-[#4A4A4A] hover:!text-[#4A4A4A] hover:!underline">
                  <span>Horário de funcionamento</span>
                  <span className="ml-1">{showOnlineHours ? '▲' : '▼'}</span>
                </a>
              </div>
              {showOnlineHours && (
                <ul className="list-disc list-inside text-[#4A4A4A] mb-4">
                  {onlineGroups.map((group, i) => (
                    <li key={i} className={group.days.includes(todayWeekday) ? 'font-bold' : ''}>
                      {joinWithAnd(group.days.map(d => weekdayNames[d]))}: {formatTime(group.startTime)} - {formatTime(group.endTime)}
                    </li>
                  ))}
                </ul>
              )}
              {isOnlineOpen && restaurant.deliveryConfig?.enabled && (
                <div className="flex items-center space-x-4 mt-4">
                  <a
                    href={`https://app.gula.menu/welcomeDelivery?pPlace=${restaurant.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!bg-[#FF5842] !text-white px-4 py-2 rounded-lg inline-block hover:!bg-[#FF5842] hover:!underline transition-all duration-300"
                  >
                    Pedir Online
                  </a>
                  {!restaurant.deliveryConfig.deliveryDisabled && (
                    <Image src="/images/icons/delivery-gray.svg" alt="Delivery disponível" width={24} height={24} unoptimized />
                  )}
                  {!restaurant.deliveryConfig.takeoutDisabled && (
                    <Image src="/images/icons/takeout-gray.svg" alt="Retirada disponível" width={24} height={24} unoptimized />
                  )}
                </div>
              )}
              {restaurant.deliveryConfig?.contactNumber && (
                <a href={`https://wa.me/${restaurant.deliveryConfig.contactNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#25D366] hover:underline mt-4">
                  <Image src="/images/icons/Whatsapp.png" alt="WhatsApp" width={24} height={24} unoptimized className="mr-2" />
                  Conversar no WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </main>
      {!hideLayout && (
        <footer className="bg-[#FF5842] text-white py-8 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Gula.menu</h3>
              <p className="text-sm">Seu guia gastronômico completo para encontrar os melhores restaurantes da sua cidade.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-white hover:text-[#FFF8F0]">Início</Link></li>
                <li><Link href={`/restaurante/${cidade}`} className="text-white hover:text-[#FFF8F0]">Restaurantes</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contato</h3>
              <p className="text-sm">contato@gula.menu<br/>São Paulo, SP - Brasil</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-600 text-center text-sm">
            <span className="text-white"> Gula.menu - Todos os direitos reservados</span>
          </div>
        </footer>
      )}
    </div>
  );
}
