// src/app/[cidade]/restaurantes/page.tsx
import { Metadata } from 'next';
import ClientComponent from './client-component';

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[#4A4A4A]">
        Restaurantes em {cidadeFormatada}
      </h1>
      
      {/* O ClientComponent agora aceita apenas o parâmetro cidade */}
      <ClientComponent cidade={cidadeFormatada} />
    </div>
  );
}
