'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Restaurant, getRestaurantsByCity, getRestaurantReviews, Review, getMenuItems, Menu } from '@/lib/restaurantService';
import Image from 'next/image';
import Link from 'next/link';
import { categoryMap } from '@/components/RestaurantCard';
import { slugify } from '@/lib/utils';

const ReviewsDrawer = dynamic(() => import('@/components/ReviewsDrawer'), { ssr: false, loading: () => null });
const PhotoGallery = dynamic(() => import('@/components/PhotoGallery'), { ssr: false, loading: () => null });

// Formata slug de cidade para exibição
const formatSlug = (slug: string): string =>
  slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');

// Mapeamento de weekday para nome em PT (sem sufixo '-feira')
const weekdayNames: Record<number, string> = {
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
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
  const [menuItems, setMenuItems] = useState<Menu[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [driveTime, setDriveTime] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const expandItem = (id: string) => {
    setExpandedItems(prev => new Set(prev).add(id));
  };  
  const openReviewsDrawer = () => { setIsReviewsDrawerOpen(true); document.body.style.overflow = 'hidden'; };
  const closeReviewsDrawer = () => { setIsReviewsDrawerOpen(false); document.body.style.overflow = 'auto'; };
  
  // Calcula a média das avaliações a partir dos reviews carregados
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };
  // Accordion state for working hours
  const [showPresentialHours, setShowPresentialHours] = useState(false);
  const [showOnlineHours, setShowOnlineHours] = useState(false);

  // Hide layout if version=restaurant param
  const searchParams = useSearchParams();
  const hideLayout = searchParams.get('version') === 'restaurant';
  const pathname = usePathname();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pageUrl = `${origin}${pathname}`;

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
          // Carregar itens do cardápio para este restaurante
          const items = await getMenuItems(found.id);
          setMenuItems(items);
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
    const onlineOpen = restaurant.deliveryConfig?.openNow ?? false;
    setIsOnlineOpen(onlineOpen);
  }, [restaurant]);

  useEffect(() => {
    if (restaurant?.coordinates && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        err => console.error('Erro ao obter geolocalização:', err)
      );
    }
  }, [restaurant, userLocation]);

  useEffect(() => {
    if (userLocation && restaurant?.coordinates) {
      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      const dest = `${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`;
      fetch(`/api/distance?origin=${origin}&destination=${dest}`)
        .then(res => res.json())
        .then(data => { if (data.duration) setDriveTime(data.duration); })
        .catch(err => console.error('Erro Distance API:', err));
    }
  }, [userLocation, restaurant]);

  // Highlight current day's hours in bold
  const nowForHighlight = new Date();
  const jsDayForHighlight = nowForHighlight.getDay();
  const todayWeekday = jsDayForHighlight === 0 ? 7 : jsDayForHighlight;

  // Prepara grupos de horários
  const presentialGroups = restaurant?.workingHours ? groupWorkingHours(restaurant.workingHours) : [];
  const onlineGroups = restaurant?.deliveryConfig?.workingHours ? groupWorkingHours(restaurant.deliveryConfig.workingHours) : [];

  // Agrupa itens por seção (ordenadas por sectionAppearanceOrder)
  const sections = useMemo(() => {
    const temp: Record<string, { name: string; order: number; items: Menu[] }> = {};
    menuItems.forEach(item => {
      const key = item.sectionName || 'Sem seção';
      if (!temp[key]) temp[key] = { name: key, order: item.sectionAppearanceOrder!, items: [] };
      temp[key].items.push(item);
    });
    return Object.values(temp)
      .map(section => {
        section.items.sort((a, b) => (a.appearanceOrder! - b.appearanceOrder!));
        return section;
      })
      .sort((a, b) => a.order - b.order);
  }, [menuItems]);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-12 h-12 border-4 border-[#F4A261] border-t-[#D32F2F] rounded-full animate-spin"></div></div>;
  }
  if (error || !restaurant) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  const renderStars = (ratingValue: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const fill = Math.max(0, Math.min(1, ratingValue - i));
      stars.push(
        <span key={i} className="relative inline-block w-5 h-5 mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.165 3.584a1 1 0 00.95.69h3.768c.969 0 1.371 1.24.588 1.81l-3.047 2.213a1 1 0 00-.364 1.118l1.165 3.584c.3.921-.755 1.688-1.538 1.118l-3.047-2.213a1 1 0 00-1.176 0l-3.047 2.213c-.783.57-1.838-.197-1.538-1.118l1.165-3.584a1 1 0 00-.364-1.118L2.575 9.011c-.783-.57-.38-1.81.588-1.81h3.768a1 1 0 00.95-.69l1.165-3.584z" />
          </svg>
          {fill > 0 && (
            <span className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#ff4500]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.165 3.584a1 1 0 00.95.69h3.768c.969 0 1.371 1.24.588 1.81l-3.047 2.213a1 1 0 00-.364 1.118l1.165 3.584c.3.921-.755 1.688-1.538 1.118l-3.047-2.213a1 1 0 00-1.176 0l-3.047 2.213c-.783.57-1.838-.197-1.538-1.118l1.165-3.584a1 1 0 00-.364-1.118L2.575 9.011c-.783-.57-.38-1.81.588-1.81h3.768a1 1 0 00.95-.69l1.165-3.584z" />
              </svg>
            </span>
          )}
        </span>
      );
    }
    return stars;
  };

  // Limite de caracteres para pré-visualização de descrição
  const SNIPPET_LENGTH = 150;

  return (
    <div className="bg-[#FFF8F0]">
      {/* Removed JSON-LD and meta description injection; now handled in head.tsx */}
      {!hideLayout && (
        <header className="bg-[#ECE2D9] text-[#4A4A4A] p-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/">
              <div role="img" aria-label="Gula.menu" className="logo-mask w-[150px] h-[50px]"></div>
            </Link>
            <nav className="flex space-x-6">
              <Link href="https://www.gulamenu.com.br/" target="_blank" rel="noopener noreferrer" className="!text-[#FF5842] hover:text-[#FFF8F0] transition-colors font-medium">
                Para Restaurantes
              </Link>
            </nav>
          </div>
        </header>
      )}
      {!hideLayout && (
        <nav className="max-w-7xl mx-auto px-6 py-2 text-sm text-[#4A4A4A]" aria-label="breadcrumb">
          <ol className="list-none flex">
            <li><Link href="/" className="hover:underline">Início</Link><span className="mx-2">/</span></li>
            <li className="font-medium">{restaurant.name}</li>
          </ol>
        </nav>
      )}
      <section className="py-6 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Roboto'] text-[#4A4A4A] text-left">Restaurante {restaurant.name}</h1>
          {restaurant.mainPhoto && (
            <PhotoGallery images={[
              restaurant.mainPhoto,
              ...restaurant.mainMenuShowcaseImages || [],
              ...restaurant.welcomeScreenImages || []
            ]} />
          )}
          {/* Culinária section moved below photo */}
          {restaurant.categories && restaurant.categories.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {restaurant.categories.map(code => (
                  <h2 key={code} className="inline-block m-0 !text-xs !font-normal !leading-none bg-[#FF5842] text-white px-2 py-1 rounded">
                    {categoryMap[code] || code}
                  </h2>
                ))}
              </div>
            </div>
          )}
          {restaurant.shortDescription && (
            <p className="mt-4 mb-4 text-base text-[#4A4A4A] text-left">
              {restaurant.shortDescription}
            </p>
          )}
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-6 pb-4">
        {(restaurant.reviewCount ?? 0) > 0 ? (
          <div className="flex items-center mb-4">
            {restaurant.instagramLink && (
              <a
                href={`https://www.instagram.com/${restaurant.instagramLink}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-[#FF5842] hover:underline mr-2"
              >
                <Image src="/images/logo/instagram.jpg" alt="Instagram Logo" width={36} height={36} unoptimized />
              </a>
            )}
            <span className="mx-2 text-[#4A4A4A]">|</span>
            <div className="flex items-center bg-[#FFF8F0] p-2 rounded ml-2">
              <span className="text-3xl font-bold text-[#4A4A4A] mr-3">{(restaurant?.rating ?? 0).toFixed(1)}</span>
              <div className="flex flex-col">
                <div className="flex mb-1">{renderStars(restaurant?.rating ?? 0)}</div>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); openReviewsDrawer(); }}
                  className="text-[#FF5842] hover:underline text-sm"
                >
                  {restaurant?.reviewCount ?? 0} avaliações no gula.menu
                </a>
              </div>
            </div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="flex items-center mb-4">
            {restaurant.instagramLink && (
              <a
                href={`https://www.instagram.com/${restaurant.instagramLink}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-[#FF5842] hover:underline mr-2"
              >
                <Image src="/images/logo/instagram.jpg" alt="Instagram Logo" width={36} height={36} unoptimized />
              </a>
            )}
            <span className="mx-2 text-[#4A4A4A]">|</span>
            <div className="flex items-center bg-[#FFF8F0] p-2 rounded ml-2">
              <span className="text-3xl font-bold text-[#4A4A4A] mr-3">{calculateAverageRating().toFixed(1)}</span>
              <div className="flex flex-col">
                <div className="flex mb-1">{renderStars(calculateAverageRating())}</div>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); openReviewsDrawer(); }}
                  className="text-[#FF5842] hover:underline text-sm"
                >
                  {reviews.length} avaliações no gula.menu
                </a>
              </div>
            </div>
          </div>
        ) : null}
        <ReviewsDrawer
          reviews={reviews}
          isOpen={isReviewsDrawerOpen}
          onClose={closeReviewsDrawer}
          rating={(restaurant?.rating && restaurant?.rating > 0) ? restaurant.rating : calculateAverageRating()}
          reviewCount={(restaurant?.reviewCount && restaurant?.reviewCount > 0) ? restaurant.reviewCount : reviews.length}
          restaurantName={restaurant?.name || ''}
        />
      </div>
      <main className="max-w-7xl mx-auto px-6 pt-0 pb-12 bg-[#FFF8F0]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ir ao Restaurante Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 text-[#4A4A4A]">Ir ao Restaurante</h3>
            <div className="flex items-center mb-4">
              <span className={isPresentialOpen ? 'text-green-600' : 'text-red-600'}>{isPresentialOpen ? 'Aberto agora' : 'Fechado agora'}</span>
              <span className="mx-2 text-[#4A4A4A]">|</span>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowPresentialHours(p => !p); }} className="text-[#FF5842] hover:underline">
                Horários
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
            <p className="text-[#4A4A4A] mb-4">
              {restaurant.addressStreet}, {restaurant.addressNumber}{restaurant.addressComplement && `, ${restaurant.addressComplement}`}, {restaurant.addressDistrict}, {restaurant.addressCity} - {restaurant.addressState}
            </p>
            {driveTime && (
              <div className="flex items-center text-sm text-[#4A4A4A] mb-2">
                <Image
                  src="/images/icons/car.png"
                  alt="Car icon"
                  width={16}
                  height={16}
                  className="h-4 w-auto mr-1"
                />
                <span>~ {driveTime}</span>
              </div>
            )}
            {restaurant.coordinates && (
              <div className="flex items-center mb-4">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#FF5842] hover:underline">
                  <Image src="/images/logo/google-maps.png" alt="Google Maps Logo" width={36} height={36} unoptimized />
                </a>
                <span className="mx-2 text-[#4A4A4A]">|</span>
                <a href={`https://www.waze.com/ul?ll=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#FF5842] hover:underline">
                  <Image src="/images/logo/waze.png" alt="Waze Logo" width={36} height={36} unoptimized />
                </a>
              </div>
            )}
          </div>
          {/* Peça Online Card (se delivery habilitado) */}
          {restaurant.deliveryConfig?.enabled && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4 text-[#4A4A4A]">Pedir Online</h3>
              <div className="flex items-center mb-4">
                <span className={isOnlineOpen ? 'text-green-600' : 'text-red-600'}>{isOnlineOpen ? 'Aberto agora' : 'Fechado agora'}</span>
                <span className="mx-2 text-[#4A4A4A]">|</span>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowOnlineHours(p => !p); }} className="text-[#FF5842] hover:underline">
                  Horários
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
                  <Image src="/images/icons/Whatsapp.png" alt="WhatsApp" width={36} height={36} unoptimized className="mr-2" />
                </a>
              )}
            </div>
          )}
        </div>
      </main>
      <main className="max-w-7xl mx-auto px-6 pt-0 pb-12 bg-[#FFF8F0]">
        <h2 className="text-2xl font-bold font-['Roboto'] text-[#4A4A4A] mb-4">Cardápio</h2>
        {sections.map(section => (
          <div key={section.name}>
            <h3 className="text-xl font-semibold text-[#4A4A4A] mt-6 mb-2">{section.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {section.items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow flex items-center">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="w-[120px] h-[120px] object-cover rounded"
                      unoptimized
                    />
                  )}
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-bold text-[#4A4A4A]">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-[#4A4A4A]">
                        {!expandedItems.has(item.id) ? (
                          <>
                            {item.description.length > SNIPPET_LENGTH
                              ? item.description.slice(0, SNIPPET_LENGTH) + '... '
                              : item.description}
                            {item.description.length > SNIPPET_LENGTH && (
                              <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); expandItem(item.id); }}
                                className="text-[#FF5842] hover:underline"
                              >
                                (ver mais)
                              </a>
                            )}
                          </>
                        ) : (
                          item.description
                        )}
                      </p>
                    )}
                    {item.price > 0 && (
                      <p className="text-sm font-semibold text-[#4A4A4A] mt-1 text-left">
                        R$ {(item.price / 100).toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
