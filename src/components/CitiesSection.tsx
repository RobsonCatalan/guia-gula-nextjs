'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppCheckContext } from '@/components/FirebaseAppCheckProvider';
import { getAllCities } from '@/lib/restaurantService';

export default function CitiesSection() {
  const [cities, setCities] = useState<string[]>([]);
  const [failedImgs, setFailedImgs] = useState<Record<string, boolean>>({});
  const { isAppCheckReady } = useAppCheckContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAppCheckReady) return;
    async function loadCities() {
      try {
        const slugs = await getAllCities();
        setCities(slugs);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    }
    loadCities();
  }, [isAppCheckReady]);

  const normalizeLabel = (slug: string) =>
    slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\bSao\b/g, 'São');

  const handleImgError = (slug: string) => {
    setFailedImgs(prev => ({ ...prev, [slug]: true }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cities.map(slug => (
        <div
          key={slug}
          onClick={() => router.push(`/restaurante/${slug}`)}
          className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          {failedImgs[slug] ? (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-[#4A4A4A]">Imagem indisponível</span>
            </div>
          ) : (
            <Image
              src={`/images/cities/${slug}.webp`}
              alt={normalizeLabel(slug)}
              width={800}
              height={500}
              className="object-cover w-full h-48"
              onError={() => handleImgError(slug)}
            />
          )}
          <div className="p-4">
            <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">
              {normalizeLabel(slug)}
            </h3>
            <p className="text-[#4A4A4A] mb-4">
              Confira restaurantes em {normalizeLabel(slug)}.
            </p>
            <div className="flex justify-end mt-2">
              <Link
                href={`/restaurante/${slug}`}
                className="bg-[#D32F2F] text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Ver mais
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
