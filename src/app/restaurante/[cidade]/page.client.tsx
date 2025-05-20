'use client';

import { useParams } from 'next/navigation';
import ClientComponent from './client-component';

export default function CityPageClient() {
  const { cidade } = useParams();
  return <ClientComponent cidade={cidade as string} />;
}
