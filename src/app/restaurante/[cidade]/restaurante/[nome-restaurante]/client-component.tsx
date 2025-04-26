'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Restaurant, getRestaurantsByCity, getRestaurantReviews, Review } from '@/lib/restaurantService';
import Image from 'next/image';
import Link from 'next/link';
import ReviewsDrawer from '@/components/ReviewsDrawer';

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

export default function RestaurantDetailClient() {
  const params = useParams();
  const cidade = params.cidade as string;
  const slug = params['nome-restaurante'] as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsDrawerOpen, setIsReviewsDrawerOpen] = useState(false);

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
          
          // Buscar avaliações do restaurante
          if (found.id) {
            const reviewsData = await getRestaurantReviews(found.id);
            setReviews(reviewsData);
          }
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

  const openReviewsDrawer = () => {
    setIsReviewsDrawerOpen(true);
    // Prevenir o scroll da página quando o drawer está aberto
    document.body.style.overflow = 'hidden';
  };

  const closeReviewsDrawer = () => {
    setIsReviewsDrawerOpen(false);
    // Restaurar o scroll da página
    document.body.style.overflow = 'auto';
  };

  // Helper to render stars based on rating
  const renderStars = (ratingValue: number) => {
    const stars: React.ReactNode[] = [];
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

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-12 h-12 border-4 border-[#F4A261] border-t-[#D32F2F] rounded-full animate-spin"></div></div>;
  }
  if (error || !restaurant) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-[#FFF8F0]">
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
      <nav className="max-w-7xl mx-auto px-6 py-2 text-sm text-[#4A4A4A]" aria-label="breadcrumb">
        <ol className="list-none flex">
          <li><Link href="/" className="hover:underline">Início</Link><span className="mx-2">/</span></li>
          <li><Link href={`/restaurante/${cidade}`} className="hover:underline">Restaurantes</Link><span className="mx-2">/</span></li>
          <li className="font-medium">{restaurant.name}</li>
        </ol>
      </nav>
      <section className="text-white py-16 bg-gradient-to-b from-[#FF7A68] to-[#FFF8F0]">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Roboto']">{restaurant.name}</h1>
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
      <main className="max-w-7xl mx-auto px-6 py-12 bg-[#FFF8F0]">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4">Detalhes</h2>
        <p className="text-[#4A4A4A] mb-4"><strong>Avaliação dos clientes:</strong></p>
        {restaurant.rating && restaurant.rating > 0 ? (
          <div className="flex items-center mb-4">
            {renderStars(restaurant.rating)}
            <button 
              onClick={openReviewsDrawer}
              className="ml-1 text-sm text-[#4A4A4A] hover:underline focus:outline-none"
            >
              {restaurant.rating.toFixed(1)} ({restaurant.reviewCount} avaliações)
            </button>
          </div>
        ) : (
          <p className="text-sm text-[#4A4A4A] mb-4">Sem avaliações</p>
        )}
        <p className="text-[#4A4A4A] mb-2">{restaurant.description}</p>
        <p className="text-[#4A4A4A] mb-2"><strong>Endereço Completo:</strong> {restaurant.address}</p>
        <p className="text-[#4A4A4A] mb-2"><strong>Rua:</strong> {restaurant.addressStreet}, {restaurant.addressNumber}{restaurant.addressComplement && `, ${restaurant.addressComplement}`}</p>
        <p className="text-[#4A4A4A] mb-2"><strong>Bairro:</strong> {restaurant.addressDistrict}</p>
        <p className="text-[#4A4A4A] mb-2"><strong>Cidade:</strong> {restaurant.addressCity} - {restaurant.addressState}</p>
        <p className="text-[#4A4A4A] mb-2"><strong>CEP:</strong> {restaurant.postalCode}</p>
        <p className="text-[#4A4A4A] mb-2">
          <a
            href={
              restaurant.deliveryConfig?.enabled
                ? `https://app.gula.menu/welcomeDelivery?pPlace=${restaurant.id}`
                : `https://app.gula.menu/mainMenu?pPlace=${restaurant.id}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF5842] hover:underline"
          >
            {restaurant.deliveryConfig?.enabled ? 'Peça agora mesmo' : 'Veja o cardápio'}
          </a>
        </p>
        {restaurant.deliveryConfig?.enabled && (
          <div className="flex items-center mb-2">
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
        {restaurant.instagramLink && (
          <p className="text-[#4A4A4A] mb-2">
            <strong>Instagram:</strong>
            <a
              href={`https://www.instagram.com/${restaurant.instagramLink}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-[#FF5842] hover:underline"
            >
              <Image
                src="/images/logo/instagram.jpg"
                alt="Instagram Logo"
                width={24}
                height={24}
                unoptimized
              />
              <span className="ml-2">Siga no Instagram</span>
            </a>
          </p>
        )}
        {restaurant.coordinates && (
          <div className="flex space-x-4 mb-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-[#FF5842] hover:underline"
            >
              <Image
                src="/images/logo/google-maps.png"
                alt="Google Maps Logo"
                width={24}
                height={24}
                unoptimized
              />
              <span className="ml-2">Venha com o Google Maps</span>
            </a>
            <a
              href={`https://www.waze.com/ul?ll=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-[#FF5842] hover:underline"
            >
              <Image
                src="/images/logo/waze.png"
                alt="Waze Logo"
                width={24}
                height={24}
                unoptimized
              />
              <span className="ml-2">Venha com o Waze</span>
            </a>
          </div>
        )}
        {restaurant.phone && <p className="text-[#4A4A4A] mb-2"><strong>Telefone:</strong> {restaurant.phone}</p>}
        {restaurant.workingHours && restaurant.workingHours.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-[#4A4A4A] mb-2">Horários de Funcionamento (Presencial)</h2>
            <ul className="list-disc list-inside">
              {(() => {
                const grouped: Record<number, {weekday: number; startTime: number; endTime: number}[]> = {};
                restaurant.workingHours.forEach(wh => {
                  if (!grouped[wh.weekday]) grouped[wh.weekday] = [];
                  grouped[wh.weekday].push(wh);
                });
                return Object.entries(grouped)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([day, hours], idx) => (
                    <li key={idx} className="text-[#4A4A4A]">
                      {weekdayNames[+day] || 'Dia inválido'}: {joinWithAnd(hours.map(h => `${formatTime(h.startTime)} - ${formatTime(h.endTime)}`))}
                    </li>
                  ));
              })()}
            </ul>
          </div>
        )}
        {restaurant.deliveryConfig?.workingHours && restaurant.deliveryConfig.workingHours.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-[#4A4A4A] mb-2">Horários de Funcionamento (Pedidos Online)</h2>
            <ul className="list-disc list-inside">
              {(() => {
                const grouped: Record<number, {weekday: number; startTime: number; endTime: number}[]> = {};
                restaurant.deliveryConfig.workingHours.forEach(wh => {
                  if (!grouped[wh.weekday]) grouped[wh.weekday] = [];
                  grouped[wh.weekday].push(wh);
                });
                return Object.entries(grouped)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([day, hours], idx) => (
                    <li key={`delivery-${idx}`} className="text-[#4A4A4A]">
                      {weekdayNames[+day] || 'Dia inválido'}: {joinWithAnd(hours.map(h => `${formatTime(h.startTime)} - ${formatTime(h.endTime)}`))}
                    </li>
                  ));
              })()}
            </ul>
          </div>
        )}
        {restaurant.menu && restaurant.menu.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4">Menu</h2>
            <ul className="space-y-4">
              {restaurant.menu.map(item => (
                <li key={item.id} className="border p-4 rounded-lg bg-white shadow-sm">
                  <h3 className="text-xl font-semibold">{item.name} – R${item.price.toFixed(2)}</h3>
                  <p className="text-[#4A4A4A]">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <footer className="bg-[#FF5842] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Gula.menu</h3>
            <p className="text-sm">Seu guia gastronômico completo para encontrar os melhores restaurantes da sua cidade.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="!text-white hover:!text-[#FFF8F0]">Início</Link></li>
              <li><Link href={`/restaurante/${cidade}`} className="!text-white hover:!text-[#FFF8F0]">Restaurantes</Link></li>
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
      {/* Drawer de Avaliações */}
      <ReviewsDrawer 
        isOpen={isReviewsDrawerOpen} 
        onClose={closeReviewsDrawer} 
        reviews={reviews} 
        rating={restaurant?.rating || 0} 
        reviewCount={restaurant?.reviewCount || 0}
        restaurantName={restaurant?.name || ''}
      />
    </div>
  );
}
