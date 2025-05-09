import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';

export const revalidate = 3600; // 1h cache

interface City {
  slug: string;
  hasImage: boolean;
}

export default async function CitiesList({ currentCity }: { currentCity?: string }) {
  // Lista cidades a partir de imagens estáticas
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'cities');
  const files = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
  const cities: City[] = files
    .filter(f => /\.(webp|jpg|png)$/i.test(f))
    .map(file => ({ slug: path.basename(file, path.extname(file)), hasImage: true }))
    .filter(c => c.slug !== currentCity);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {cities.map(c => {
        const label = c.slug
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
          .replace(/\bSao\b/g, 'São');
        return (
          <Link
            key={c.slug}
            href={`/restaurante/${c.slug}`}
            className="flex flex-col items-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="relative w-full h-32">
              {c.hasImage ? (
                <Image
                  src={`/images/cities/${c.slug}.webp`}
                  alt={label}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">{label}</span>
                </div>
              )}
            </div>
            <span className="text-[#FF5842] text-sm font-medium block text-center p-4">
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
