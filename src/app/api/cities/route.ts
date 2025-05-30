// src/app/api/cities/route.ts
import { NextResponse } from 'next/server';
import { getCitiesByState } from '@/lib/restaurantService.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') || 'sao-paulo';
  try {
    const cities = await getCitiesByState(state);
    return NextResponse.json({ cities }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('Error in /api/cities:', err);
    return NextResponse.json({ cities: [] }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
