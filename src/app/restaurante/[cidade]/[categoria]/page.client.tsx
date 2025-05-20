'use client';

import { useParams } from 'next/navigation';
import CategoryClientComponent from './client-component';

export default function CategoryPageClient() {
  const { cidade, categoria } = useParams();
  return <CategoryClientComponent cidade={cidade as string} categoria={categoria as string} />;
}
