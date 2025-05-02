// src/app/restaurante/[cidade]/[categoria]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import CategoryClientComponent from './client-component';
import CategorySection from '@/components/CategorySection';
import { Suspense } from 'react';

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

// Gera slug a partir do label
const slugify = (str: string) =>
  str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

// Formata slug para exibição (Capitalização)
const formatSlug = (slug: string) =>
  slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSao\b/g, 'São');

// Obtém label a partir do slug
const getLabelFromSlug = (slug: string) => {
  const entry = Object.entries(categoryMap).find(([, label]) => slugify(label) === slug);
  return entry ? entry[1] : slug;
};

export async function generateMetadata(props: { params: any }): Promise<Metadata> {
  const { params } = props;
  const { cidade, categoria } = await params;
  const cidadeFormatada = formatSlug(cidade);
  const categoriaLabel = getLabelFromSlug(categoria);
  return {
    title: `${categoriaLabel} em ${cidadeFormatada} | Gula.menu`,
    description: `Descubra ${categoriaLabel} em ${cidadeFormatada}. Avaliações, menus e reservas.`,
    metadataBase: new URL('http://localhost:3001')
  };
}

export async function generateStaticParams() {
  const cities = ['belo-horizonte', 'sao-paulo'];
  const categories = Object.values(categoryMap).map(label => slugify(label));
  const params: Array<{ cidade: string; categoria: string }> = [];
  cities.forEach(city => {
    categories.forEach(cat => {
      params.push({ cidade: city, categoria: cat });
    });
  });
  return params;
}

export default async function CategoryPage(props: { params: any }) {
  const { params } = props;
  const { cidade, categoria } = await params;
  const cidadeFormatada = formatSlug(cidade);
  const categoriaLabel = getLabelFromSlug(categoria);
  // Ajuste de slug para nomes de imagem (ex: pastelaria -> pastel)
  const imageSlug = categoria === 'pastelaria' ? 'pastel' : categoria;

  return (
    <div className="bg-[#FFF8F0]">
      {/* Header similar à home */}
      <header className="bg-[#ECE2D9] text-[#4A4A4A] p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div role="img" aria-label="Gula.menu" className="logo-mask w-[150px] h-[50px]"></div>
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

      <main className="max-w-7xl mx-auto px-6 py-12 bg-[#FFF8F0]">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-6">
          Restaurantes da Categoria {categoriaLabel} em {cidadeFormatada}
        </h2>
        <Suspense fallback={<div>Carregando restaurantes...</div>}>
          <CategoryClientComponent cidade={cidade} categoria={categoria} />
        </Suspense>
      </main>
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
