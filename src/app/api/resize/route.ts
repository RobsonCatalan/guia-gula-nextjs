import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get('url');
  const width = parseInt(searchParams.get('w') || '800', 10);
  const quality = parseInt(searchParams.get('q') || '75', 10);

  if (!src) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(src);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: res.status });
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const optimized = await sharp(buffer)
      .resize({ width })
      .jpeg({ quality })
      .toBuffer();

    return new NextResponse(optimized, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Image processing error' }, { status: 500 });
  }
}
