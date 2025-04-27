'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from './Footer';

export default function LayoutFooter() {
  const searchParams = useSearchParams();
  const version = searchParams.get('version');
  if (version === 'restaurant') return null;
  return <Footer />;
}
