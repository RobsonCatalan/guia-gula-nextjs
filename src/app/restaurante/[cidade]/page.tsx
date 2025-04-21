// src/app/[cidade]/restaurantes/page.tsx
import { Metadata } from 'next';
import ClientComponent from './client-component';
import Image from 'next/image';
import CategorySection from '@/components/CategorySection';

export async function generateMetadata({ 
  params 
}: { 
  params: { cidade: string } 
}): Promise<Metadata> {
  // A solução correta: await o objeto params completo antes de acessar suas propriedades
  const resolvedParams = await params;
  const cidade = resolvedParams.cidade;
  
  // Formata a cidade para exibição
  const cidadeFormatada = cidade
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `Restaurantes em ${cidadeFormatada} | Gula.menu`,
    description: `Descubra os melhores restaurantes em ${cidadeFormatada}. Encontre avaliações, menus e faça reservas.`,
    metadataBase: new URL('http://localhost:3001'),
  };
}

export async function generateStaticParams() {
  return [
    { cidade: 'belo-horizonte' },
    { cidade: 'sao-paulo' }
  ];
}

export default async function RestaurantesPage({ 
  params 
}: { 
  params: { cidade: string } 
}) {
  // A solução correta: await o objeto params completo antes de acessar suas propriedades
  const resolvedParams = await params;
  const cidade = resolvedParams.cidade;
  
  // Formata a cidade para exibição
  const cidadeFormatada = cidade
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  console.log(`Cidade: ${cidadeFormatada}`);
  
  // Em vez de buscar os dados no servidor (onde temos problemas de permissão),
  // vamos passar a cidade para o Cliente e deixar que ele busque os dados
  return (
    <div className="bg-[#FFF8F0]">
      <section className="text-white py-16 bg-gradient-to-b from-[#FF7A68] to-[#FFF8F0]">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Roboto']">
            Restaurantes em {cidadeFormatada}
          </h1>
          <Image
            src={`/images/cities/${cidade}.webp`}
            alt={`Imagem de ${cidadeFormatada}`}
            width={800}
            height={400}
            className="object-cover w-full h-64 rounded-lg"
            priority
          />
        </div>
      </section>
      <CategorySection city={cidade} />
      <main className="max-w-7xl mx-auto px-6 py-12 bg-[#FFF8F0]">
        <ClientComponent cidade={cidadeFormatada} />
      </main>
    </div>
  );
}
