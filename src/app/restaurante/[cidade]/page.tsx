import type { Metadata } from 'next';
import type { Metadata as NextMetadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import CategorySection, { categoryMap } from '@/components/CategorySection';
import CitiesSection from '@/components/CitiesSection';
import CityPageClient from './page.client';
import { getAllCities, getRestaurantsByCity } from '@/lib/restaurantService.server';
import { slugify, formatSlug } from '@/lib/utils';
import Link from 'next/link';
import type { Restaurant } from '@/lib/restaurantService';

export const dynamic = 'force-static';
// ISR: regenerate page every 1 hour
export const revalidate = 3600;

// Pre-generate pages only for valid city slugs
export async function generateStaticParams(): Promise<{ cidade: string }[]> {
  let cities: string[] = []
  try {
    cities = await getAllCities()
  } catch (e) {
    console.error('Error generating static params for cities', e)
  }
  return cities.map(cidade => ({ cidade }))
}

export async function generateMetadata({ params }: { params: { cidade: string } }): Promise<NextMetadata> {
  const { cidade } = await params;
  
  // Formata a cidade para exibição
  const cidadeFormatada = cidade
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São')
    .replace(/\bGoncalves\b/g, 'Gonçalves');
  
  return {
    title: `Restaurantes em ${cidadeFormatada} | Gula.menu`,
    description: `Descubra os melhores restaurantes em ${cidadeFormatada}. Encontre avaliações, menus e horários.`,
    metadataBase: new URL('http://localhost:3001'),
  };
}

export default async function Page({ params }: { params: { cidade: string } }) {
  const { cidade } = await params;
  let initialRestaurants: Restaurant[] = [];
  try {
    const result = await getRestaurantsByCity(cidade);
    initialRestaurants = result.restaurants;
  } catch (error) {
    console.error('Error fetching restaurants for city', cidade, error);
  }
  // Generate static category labels for SSR fallback
  const categoryCodes = initialRestaurants.flatMap(r => r.categories || []);
  const uniqueCodes = Array.from(new Set(categoryCodes));
  const categoryLabels = uniqueCodes.map(code => categoryMap[code] || code);
  const cidadeFormatada = cidade
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São')
    .replace(/\bGoncalves\b/g, 'Gonçalves');
  // Generate static list of other cities for SSR fallback
  const allCities = await getAllCities();
  const otherCities = allCities.filter(slug => slug !== cidade);

  return (
    <>
      <header className="bg-[#FFF8F0] text-[#4A4A4A] p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <div role="img" aria-label="Gula.menu" className="logo-mask w-[150px] h-[50px]"></div>
          </Link>
          <nav className="flex space-x-6">
            <Link href="https://www.gulamenu.com.br/" target="_blank" rel="noopener noreferrer" className="!text-[#FF5842] hover:text-[#FFF8F0] transition-colors font-medium">Para Restaurantes</Link>
          </nav>
        </div>
      </header>
      <div className="bg-[#FFF8F0]">
        <nav className="max-w-7xl mx-auto px-6 py-2 text-sm text-[#4A4A4A]" aria-label="breadcrumb">
          <ol className="list-none flex">
            <li>
              <Link href="/" className="hover:underline">Início</Link>
              <span className="mx-2">/</span>
            </li>
            <li className="font-medium">{cidadeFormatada}</li>
          </ol>
        </nav>
      </div>

      {/* Static fallback for bots (no JS) */}
      <noscript>
        <section className="py-6 bg-[#FFF8F0]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#4A4A4A] mb-6">Categorias</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categoryLabels.map(label => (
                <Link key={label} href={`/restaurante/${cidade}/${slugify(label)}`} className="text-[#FF5842] font-medium block text-center">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </noscript>
      {/* Interactive category section */}
      <CategorySection city={cidade} title="" />

      <div className="bg-[#FFF8F0]">
        <main className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold font-['Roboto'] text-[#4A4A4A] mb-6">
            Todos os Restaurantes em {cidadeFormatada}
          </h1>
          <Suspense fallback={<p className="text-center py-8">Carregando restaurantes...</p>}>
            <CityPageClient cidade={cidade} initialRestaurants={initialRestaurants} />
          </Suspense>
        </main>
      </div>

      {/* Explore outras Cidades */}
      <section className="py-6 mt-0 px-6 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#4A4A4A] mb-6">Explore outras Cidades</h2>
          <noscript>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {otherCities.map(slug => (
                <Link key={slug} href={`/restaurante/${slug}`} className="text-[#FF5842] font-medium block text-center">
                  {formatSlug(slug)}
                </Link>
              ))}
            </div>
          </noscript>
          <CitiesSection currentCity={cidade} />
        </div>
      </section>

      <div className="mt-0 py-6 text-center bg-[#FFF8F0]">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4 font-['Roboto']">
          Conheça o Gula.menu
        </h2>
        <p className="text-[#4A4A4A] max-w-3xl mx-auto">
          Descubra restaurantes de diversas culinárias na sua cidade, veja os cardápios, avaliações, horários de funcionamento e disponibilidade de delivery. Se você for proprietário de um restaurante acesse <a href="https://www.gulamenu.com.br/" target="_blank" rel="noopener noreferrer" className="font-medium text-[#FF5842] underline">gulamenu.com.br</a>
        </p>
      </div>
    </>
  );
}
