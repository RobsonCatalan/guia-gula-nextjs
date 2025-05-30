'use client';

import { useEffect } from 'react';

export default function UnregisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => registrations.forEach(r => r.unregister()))
        .catch(err => console.error('Service worker unregister failed:', err));
    }
  }, []);

  return null;
}
