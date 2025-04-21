// src/app/restaurante/[cidade]/[categoria]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import CategoryClientComponent from '@/components/CategoryClientComponent';
import CategorySection from '@/components/CategorySection';

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
    .join(' ');

// Obtém label a partir do slug
const getLabelFromSlug = (slug: string) => {
  const entry = Object.entries(categoryMap).find(([, label]) => slugify(label) === slug);
  return entry ? entry[1] : slug;
};

export async function generateMetadata({ params }: { params: { cidade: string; categoria: string } }): Promise<Metadata> {
  const { cidade, categoria } = params;
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

export default function CategoryPage({ params }: { params: { cidade: string; categoria: string } }) {
  const { cidade, categoria } = params;
  const cidadeFormatada = formatSlug(cidade);
  const categoriaLabel = getLabelFromSlug(categoria);
  // Ajuste de slug para nomes de imagem (ex: pastelaria -> pastel)
  const imageSlug = categoria === 'pastelaria' ? 'pastel' : categoria;

  return (
    <div className="bg-[#FFF8F0]">
      {/* Header similar à home */}
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
            <Link href="/" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Início</Link>
            <Link href="#" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Cidades</Link>
            <Link href="#" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Culinárias</Link>
            <Link href="#" className="!text-white hover:text-[#FFF8F0] transition-colors font-medium">Sobre</Link>
          </nav>
          <button className="md:hidden text-2xl text-white">☰</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-white py-16 bg-gradient-to-b from-[#FF7A68] to-[#FFF8F0]">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Roboto']">
            {categoriaLabel} em {cidadeFormatada}
          </h1>
          <Image
            src={`/images/categories/${imageSlug}.webp`}
            alt={`Imagem de ${categoriaLabel}`}
            width={800}
            height={400}
            className="object-cover w-full h-64 rounded-lg"
            priority
          />
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12 bg-[#FFF8F0]">
        <CategoryClientComponent cidade={cidade} categoria={categoria} />
      </main>
      <CategorySection city={cidade} title={`Explore outras Categorias de Restaurantes em ${cidadeFormatada}`} />
      {/* Footer */}
      <footer className="bg-[#FF5842] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Gula.menu</h3>
            <p className="text-sm">
              Seu guia gastronômico completo para encontrar os melhores 
              restaurantes da sua cidade.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="/" className="!text-white hover:!text-[#FFF8F0]">Início</a></li>
              <li><a href="#" className="!text-white hover:!text-[#FFF8F0]">Cidades</a></li>
              <li><a href="#" className="!text-white hover:!text-[#FFF8F0]">Culinárias</a></li>
              <li><a href="#" className="!text-white hover:!text-[#FFF8F0]">Sobre</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contato</h3>
            <p className="text-sm">
              contato@gula.menu<br />
              São Paulo, SP - Brasil
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-600 text-center text-sm">
          <span className="text-white">&copy; {new Date().getFullYear()} Gula.menu - Todos os direitos reservados</span>
        </div>
      </footer>
    </div>
  );
}
