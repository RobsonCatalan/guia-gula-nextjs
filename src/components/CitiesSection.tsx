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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cities.map(slug => {
        const label = normalizeLabel(slug);
        return (
          <Link
            key={slug}
            href={`/restaurante/${slug}`}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow block overflow-hidden"
          >
            <div className="relative w-full h-32">
              <Image
                src={`/images/cities/${slug}.webp`}
                alt={label}
                fill
                sizes="(min-width: 1024px) 16.66vw, (min-width: 768px) 25vw, (min-width: 640px) 33.33vw, 50vw"
                className="object-cover"
                onError={() => handleImgError(slug)}
              />
            </div>
            <div className="p-4">
              <span className="text-[#D32F2F] font-medium block text-center">{label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
