// src/app/api/cities/route.ts
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'cities');
    const files = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
    const data = files
      .filter(f => /\.(webp|jpg|png)$/.test(f))
      .map(file => {
        const slug = path.basename(file, path.extname(file));
        return { slug, hasImage: true };
      });

    return NextResponse.json(
      data,
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      [],
      {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=3600' },
      }
    );
  }
}
