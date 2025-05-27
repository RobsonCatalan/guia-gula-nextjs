// src/app/restaurante/[cidade]/[categoria]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import CategorySection from '@/components/CategorySection';
import { bucket } from '@/lib/firebaseAdmin';
import { getAllCities, getRestaurantsByCity } from '@/lib/restaurantService.server';
import CategoryClientComponent from './client-component';
import { slugify } from '@/lib/utils';

// Mapeamento de códigos de categoria para labels
const categoryMap: Record<string, string> = {
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

// Formata slug para exibição (Capitalização)
const formatSlug = (slug: string) =>
  slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São')
    .replace(/\bGoncalves\b/g, 'Gonçalves');

// Obtém label a partir do slug
const getLabelFromSlug = (slug: string) => {
  const entry = Object.entries(categoryMap).find(([, label]) => slugify(label) === slug);
  return entry ? entry[1] : slug;
};

// Gera slug a partir do label
const getCodeFromSlug = (slug: string) => {
  const entry = Object.entries(categoryMap).find(([code, label]) => slugify(label) === slug);
  return entry ? entry[0] : slug;
};

export async function generateMetadata({ params }: { params: { cidade: string; categoria: string } }): Promise<Metadata> {
  const { cidade, categoria } = await params;
  const cidadeFormatada = formatSlug(cidade);
  const categoriaLabel = getLabelFromSlug(categoria);
  return {
    title: `Restaurantes da Categoria ${categoriaLabel} em ${cidadeFormatada} | Gula.menu`,
    description: `Descubra restaurantes em ${cidadeFormatada} da categoria ${categoriaLabel}. Veja avaliações, menus e horários.`,
    metadataBase: new URL('http://localhost:3001')
  };
}

export async function generateStaticParams() {
  const cities = await getAllCities();
  const categories = Object.values(categoryMap).map(label => slugify(label));
  return cities.flatMap((cidade) =>
    categories.map((categoria) => ({ cidade, categoria }))
  );
}

// Configuração de cache no servidor - 1 hora (3600 segundos)
export const revalidate = 3600; // 1 hora de cache

export default async function CategoryPage({ params }: { params: { cidade: string; categoria: string } }) {
  const { cidade, categoria } = await params;
  const { restaurants: allRestaurants } = await getRestaurantsByCity(cidade);
  const code = getCodeFromSlug(categoria);
  const restaurants = allRestaurants.filter(r => (r.categories || []).includes(code));
  // Generate static category labels for SSR fallback
  const allCategoryCodes = allRestaurants.flatMap(r => r.categories || []);
  const uniqueCategoryCodes = Array.from(new Set(allCategoryCodes));
  const categoryLabels = uniqueCategoryCodes.map(code => categoryMap[code] || code);
  const cidadeFormatada = formatSlug(cidade);
  const categoriaLabel = getLabelFromSlug(categoria);
  let categoriaImageUrl = '';
  if (bucket) {
    try {
      const file = bucket.file(`categories/${categoria === 'pastelaria' ? 'pastel' : categoria}.webp`);
      const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 3600 * 1000 });
      categoriaImageUrl = url;
    } catch (err) {
      console.error('Failed to get signed URL for category image', err);
    }
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://www.gulamenu.com.br/" },
      { "@type": "ListItem", "position": 2, "name": cidadeFormatada, "item": `https://www.gulamenu.com.br/restaurante/${cidade}` },
      { "@type": "ListItem", "position": 3, "name": categoriaLabel, "item": `https://www.gulamenu.com.br/restaurante/${cidade}/${categoria}` }
    ]
  };

  return (
    <div className="bg-[#FFF8F0]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* Header similar à home */}
      <header className="bg-[#ECE2D9] text-[#4A4A4A] p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <div role="img" aria-label="Gula.menu" className="logo-mask w-[150px] h-[50px]"></div>
          </Link>
          <nav className="flex space-x-6">
            <Link href="https://www.gulamenu.com.br/" target="_blank" rel="noopener noreferrer" className="!text-[#FF5842] hover:text-[#FFF8F0] transition-colors font-medium">Para Restaurantes</Link>
          </nav>
        </div>
      </header>
      <nav className="max-w-7xl mx-auto px-6 py-2 text-sm text-[#4A4A4A]" aria-label="breadcrumb">
        <ol className="list-none flex">
          <li>
            <Link href="/" className="hover:underline">Início</Link>
            <span className="mx-2">/</span>
          </li>
          <li>
            <Link href={`/restaurante/${cidade}`} className="hover:underline">{cidadeFormatada}</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="font-medium">{categoriaLabel}</li>
        </ol>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6 bg-[#FFF8F0]">
        <h1 className="text-2xl font-bold text-[#4A4A4A] mb-6">
          Restaurantes da Categoria {categoriaLabel} em {cidadeFormatada}
        </h1>
        {/* Client component handles fetching of restaurants, ratings and distances */}
        <CategoryClientComponent cidade={cidade} categoria={categoria} initialRestaurants={restaurants} />
      </main>
      {/* Static fallback for bots (no JS) */}
      <noscript>
        <section className="py-6 bg-[#FFF8F0]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#4A4A4A] mb-6">{`Explore outras Categorias de Restaurantes em ${cidadeFormatada}`}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categoryLabels.map(label => (
                <Link key={label} href={`/restaurante/${cidade}/${slugify(label)}`} className="text-[#FF5842] font-medium block text-center">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </noscript>
      <CategorySection city={cidade} title={`Explore outras Categorias de Restaurantes em ${cidadeFormatada}`} currentCategory={categoria} />
      <div className="mt-0 py-6 text-center">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4 font-['Roboto']">
          Conheça o Gula.menu
        </h2>
        <p className="text-[#4A4A4A] max-w-3xl mx-auto">
          Descubra restaurantes de diversas culinárias na sua cidade, veja os cardápios, avaliações, horários de funcionamento e disponibilidade de delivery. Se você for proprietário de um restaurante <a href="https://www.gulamenu.com.br/" target="_blank" rel="noopener noreferrer" className="font-medium text-[#FF5842] underline">clique aqui</a>
        </p>
      </div>
    </div>
  );
}
