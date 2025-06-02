import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { slugify, formatSlug, stateNames } from '@/lib/utils';
import { getAllStates, getCitiesByState } from '@/lib/restaurantService.server';
import Link from 'next/link';
import HomePageClient from '@/components/HomePageClient';

// Force dynamic SSR since we use cookies and cannot static render
export const dynamic = 'force-dynamic';
export const revalidate = 3600;
export const runtime = 'nodejs';

export default async function Home() {
  // SSR: estado selecionado, options e primeiras cidades
  const cookieStore = await cookies();
  const cityCookie = cookieStore.get('selectedCity')?.value;
  if (cityCookie) return redirect(`/restaurante/${cityCookie}`);
  const states = await getAllStates();
  const stateOptions = states.map(s => ({ value: s, label: stateNames[s] || formatSlug(s) }));
  const defaultState = states.includes('sao-paulo') ? 'sao-paulo' : (states[0] || '');
  const initialCities = await getCitiesByState(defaultState);
  const breadcrumbHref = cityCookie ? `/restaurante/${cityCookie}` : '/';

  console.log('SSR States:', states);
  console.log('SSR Default State:', defaultState);
  console.log('SSR Initial Cities:', initialCities);

  return (
    <>
      {/* Header e breadcrumb */}
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
            <li><Link href={breadcrumbHref} className="hover:underline">Início</Link></li>
          </ol>
        </nav>
      </div>
      {/* Hero */}
      <section className="py-12 bg-[#ECE2D9]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-[#4A4A4A] text-3xl md:text-4xl font-bold">Os Melhores Restaurantes para Visitar ou Pedir</h1>
        </div>
      </section>
      {/* Removed duplicate state selector and cities section; using HomePageClient only */}
      {/* Full interactive page */}
      <HomePageClient stateOptions={stateOptions} initialState={defaultState} initialCities={initialCities} />
    </>
  );
}
