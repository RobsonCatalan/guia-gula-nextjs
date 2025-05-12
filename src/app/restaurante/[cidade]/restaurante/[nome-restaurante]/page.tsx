import type { Metadata } from 'next';
import RestaurantDetailClient from './client-component';

// ISR: regenerate page every 1 hour
export const revalidate = 3600; // 1h cache no servidor

export async function generateMetadata({ params }: { params: Promise<{ cidade: string; ['nome-restaurante']: string }> }): Promise<Metadata> {
  // Await dynamic params per Next.js sync-dynamic-apis
  const { cidade, ['nome-restaurante']: nomeSlug } = await params;
  // Format slugs for display
  const formatSlug = (slugVal: string): string =>
    slugVal
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/\bSao\b/g, 'São');
  const cidadeFormatada = formatSlug(cidade);
  const nomeFormatado = formatSlug(nomeSlug);
  return {
    title: `Restaurante ${nomeFormatado} em ${cidadeFormatada} | Gula.menu`,
    description: `${nomeFormatado}: Restaurante em ${cidadeFormatada}`,
    metadataBase: new URL('http://localhost:3001'),
  };
}

export default function Page() {
  return <RestaurantDetailClient />;
}
