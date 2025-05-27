import { cookies } from 'next/headers';
import { slugify, formatSlug } from '@/lib/utils';
import { getAllCities, getRestaurantsByCity } from '@/lib/restaurantService.server';
import HomeClient from './page.client';

export const revalidate = 3600;

export default async function Home() {
  const cookieStore = await cookies();
  const selectedCity = cookieStore.get('selectedCity')?.value || 'sao-paulo';
  const slugs = await getAllCities();
  const cityOptions = slugs.map(slug => ({ value: slug, label: formatSlug(slug) }));
  const { restaurants: initialRestaurants } = await getRestaurantsByCity(selectedCity);

  return (
    <>
      {/* Static fallback for bots (no JS) */}
      <noscript>
        <div className="max-w-7xl mx-auto p-6">
          <h2 className="text-3xl font-bold mb-6">{`Restaurantes em ${formatSlug(selectedCity)}`}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialRestaurants.map(r => (
              <a
                key={r.id}
                href={`/restaurante/${selectedCity}/restaurante/${slugify(r.name)}`}
                className="block p-4 bg-white rounded shadow"
              >
                {r.name}
              </a>
            ))}
          </div>
        </div>
      </noscript>

      {/* Full interactive page */}
      <HomeClient cityOptions={cityOptions} defaultCity={selectedCity} />
    </>
  );
}
