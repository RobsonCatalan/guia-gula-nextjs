'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface PhotoGalleryProps {
  images: string[];
}

export default function PhotoGallery({ images }: PhotoGalleryProps) {
  // Filtra fontes vazias
  const validImages = images.filter(img => img && img.trim() !== '');
  if (validImages.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 flex justify-center items-center text-gray-500 rounded-lg">
        Sem fotos disponíveis
      </div>
    );
  }

  // Detecta GIFs animados e preserva animação
  const isGif = (url: string) => /\.(gif)(\?.*)?$/i.test(url);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const prev = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setCurrentIndex(prevIndex => (prevIndex + validImages.length - 1) % validImages.length);
  };

  const next = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setCurrentIndex(prevIndex => (prevIndex + 1) % validImages.length);
  };

  return (
    <div>
      {/* Desktop view */}
      <div className="hidden md:flex space-x-4">
        {/* Main image: ocupa 1/3 */}
        <div className="relative w-1/3 cursor-pointer" onClick={() => openModal(0)}>
          <Image
            unoptimized={isGif(validImages[0])}
            src={validImages[0]}
            alt={`Foto ${1}`}
            width={800}
            height={400}
            className="rounded-lg object-cover w-full h-48"
            priority
          />
        </div>
        {/* Thumbnails: grid 2/3 */}
        <div className="grid grid-cols-2 gap-2 w-2/3 max-h-48 overflow-y-auto">
          {validImages.slice(1).map((img, idx) => (
            <div key={idx + 1} className="relative w-full h-24 cursor-pointer" onClick={() => openModal(idx + 1)}>
              <Image
                unoptimized={isGif(img)}
                src={img}
                alt={`Foto ${idx + 2}`}
                width={400}
                height={200}
                className="rounded-lg object-cover w-full h-full"
                priority
              />
            </div>
          ))}
        </div>
      </div>
      {/* Mobile view */}
      <div className="md:hidden relative">
        <div className="relative w-full h-64 overflow-hidden cursor-pointer" onClick={() => openModal(currentIndex)}>
          <Image
            unoptimized={isGif(validImages[currentIndex])}
            src={validImages[currentIndex]}
            alt={`Foto ${currentIndex + 1}`}
            fill
            className="rounded-lg object-contain"
            priority
          />
          {validImages.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                onClick={prev}
              >
                ‹
              </button>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                onClick={next}
              >
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {validImages.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-[#FF5842]' : 'bg-white bg-opacity-50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-label="Galeria de fotos"
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={e => { e.stopPropagation(); closeModal(); }}
          >
            ×
          </button>
          {validImages.length > 1 && (
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl"
              onClick={e => { e.stopPropagation(); prev(e); }}
            >
              ‹
            </button>
          )}
          <div className="max-w-full max-h-full">
            <Image
              unoptimized={isGif(validImages[currentIndex])}
              src={validImages[currentIndex]}
              alt={`Foto ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="rounded-lg object-contain"
            />
          </div>
          {validImages.length > 1 && (
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl"
              onClick={e => { e.stopPropagation(); next(e); }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
