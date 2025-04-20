'use client';

import { useEffect, useState } from 'react';

interface CityDetectorProps {
  onCityDetected?: (city: string) => void;
}

export default function CityDetector({ onCityDetected }: CityDetectorProps) {
  const [city, setCity] = useState<string>('');

  useEffect(() => {
    const fetchByIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          if (data.city) {
            setCity(data.city);
            onCityDetected?.(data.city);
          }
        }
      } catch (error) {
        console.error('IP geolocation error:', error);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
            );
            if (res.ok) {
              const json = await res.json();
              if (json.city) {
                setCity(json.city);
                onCityDetected?.(json.city);
                return;
              }
            }
          } catch (error) {
            console.error('Reverse geocode error:', error);
          }
          fetchByIP();
        },
        (error) => {
          console.error('Geolocation error:', error);
          fetchByIP();
        }
      );
    } else {
      fetchByIP();
    }
  }, []);

  useEffect(() => {
    if (city && onCityDetected) {
      onCityDetected(city);
    }
  }, [city, onCityDetected]);

  if (!city) return null;

  return (
    <div className="text-center text-[#4A4A4A] mt-6 mb-8">
      Você está acessando de <strong>{city}</strong>.
    </div>
  );
}
