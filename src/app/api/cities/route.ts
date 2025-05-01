// src/app/api/cities/route.ts
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { getAllCities } from '@/lib/restaurantService';

export async function GET() {
  try {
    const cities = await getAllCities();
    const data = cities.map((slug) => {
      const imgPath = path.join(process.cwd(), 'public', 'images', 'cities', `${slug}.webp`);
      const hasImage = fs.existsSync(imgPath);
      return { slug, hasImage };
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json([]);
  }
}
