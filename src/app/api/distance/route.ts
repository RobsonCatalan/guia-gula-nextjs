import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Missing GOOGLE_MAPS_API_KEY');
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=driving&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Google Maps API responded with status', res.status);
      return NextResponse.json({ error: 'Google Maps API error' }, { status: res.status });
    }
    const data = await res.json();
    const duration = data.rows?.[0]?.elements?.[0]?.duration?.text || '';
    return NextResponse.json({ duration });
  } catch (error) {
    console.error('Error fetching Distance Matrix API:', error);
    return NextResponse.json({ error: 'Failed to fetch duration' }, { status: 500 });
  }
}
