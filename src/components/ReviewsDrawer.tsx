'use client';

import React, { useEffect, useState } from 'react';
import { Review, countReviewsByRating } from '@/lib/restaurantService';
import Image from 'next/image';

interface ReviewsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
  rating: number;
  reviewCount: number;
  restaurantName: string;
}

const formatDate = (date: Date | string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export default function ReviewsDrawer({ 
  isOpen, 
  onClose, 
  reviews, 
  rating, 
  reviewCount,
  restaurantName 
}: ReviewsDrawerProps) {
  const [counts, setCounts] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });
  const [filteredRating, setFilteredRating] = useState<number | null>(null);
  
  // Filtrar reviews com comentários
  const reviewsWithComments = reviews
    .filter(r => r.comment && r.comment.trim().length > 0)
    // Ordenar por nota (maior primeiro) e depois por data (mais recente primeiro)
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  
  // Aplicar filtro por rating se estiver ativo
  const displayedReviews = filteredRating !== null
    ? reviewsWithComments.filter(r => Math.floor(r.rating) === filteredRating)
    : reviewsWithComments;
  
  useEffect(() => {
    setCounts(countReviewsByRating(reviews));
  }, [reviews]);

  // Renderizar as 5 estrelas
  const renderStars = (ratingValue: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const fill = Math.max(0, Math.min(1, ratingValue - i));
      stars.push(
        <span key={i} className="relative inline-block w-4 h-4 mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.165 3.584a1 1 0 00.95.69h3.768c.969 0 1.371 1.24.588 1.81l-3.047 2.213a1 1 0 00-.364 1.118l1.165 3.584c.3.921-.755 1.688-1.538 1.118l-3.047-2.213a1 1 0 00-1.176 0l-3.047 2.213c-.783.57-1.838-.197-1.538-1.118l1.165-3.584a1 1 0 00-.364-1.118L2.575 9.011c-.783-.57-.38-1.81.588-1.81h3.768a1 1 0 00.95-.69l1.165-3.584z" />
          </svg>
          {fill > 0 && (
            <span className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#FF5842]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.165 3.584a1 1 0 00.95.69h3.768c.969 0 1.371 1.24.588 1.81l-3.047 2.213a1 1 0 00-.364 1.118l1.165 3.584c.3.921-.755 1.688-1.538 1.118l-3.047-2.213a1 1 0 00-1.176 0l-3.047 2.213c-.783.57-1.838-.197-1.538-1.118l1.165-3.584a1 1 0 00-.364-1.118L2.575 9.011c-.783-.57-.38-1.81.588-1.81h3.768a1 1 0 00.95-.69l1.165-3.584z" />
              </svg>
            </span>
          )}
        </span>
      );
    }
    return stars;
  };

  // Função para filtrar reviews por rating
  const handleFilterByRating = (star: number) => {
    if (filteredRating === star) {
      // Se clicar na mesma estrela, remove o filtro
      setFilteredRating(null);
    } else {
      setFilteredRating(star);
    }
  };

  // Função para limpar filtro
  const clearFilter = () => {
    setFilteredRating(null);
  };

  // Calcular a porcentagem de cada rating
  const getPercentage = (count: number) => {
    return reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 overflow-hidden z-50 flex justify-end">
      {/* Drawer / Painel lateral */}
      <div className="w-full max-w-md md:max-w-lg shadow-xl">
        <div className="h-screen bg-[#FFF8F0] shadow-xl flex flex-col overflow-y-auto">
          {/* Cabeçalho */}
          <div className="px-4 py-6 bg-[#FF5842] text-white sticky top-0 z-10">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold">Avaliações</h2>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 focus:outline-none"
                aria-label="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm font-medium text-white/90">{restaurantName}</p>
          </div>
          
          {/* Conteúdo do drawer */}
          <div className="px-4 py-6">
            {/* Resumo das avaliações */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="text-4xl font-bold mr-3 text-[#3A3A3A]">{rating.toFixed(1)}</div>
                <div>
                  <div className="flex">{renderStars(rating)}</div>
                  <div className="text-sm text-[#3A3A3A]">{reviewCount} avaliações</div>
                </div>
              </div>
              
              {/* Barras de avaliação */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center">
                    <div className="w-12 text-sm font-medium text-[#3A3A3A]">{star} {star === 1 ? 'estrela' : 'estrelas'}</div>
                    <div className="flex-1 h-2 mx-2 bg-[#cfcfcf] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#FF5842]" 
                        style={{ width: `${getPercentage(counts[star])}%` }}
                      ></div>
                    </div>
                    <a 
                      onClick={() => handleFilterByRating(star)}
                      className={`w-12 text-sm text-right font-medium cursor-pointer !underline ${filteredRating === star ? '!text-[#FF5842]' : '!text-[#4A4A4A] hover:!text-[#FF5842]'}`}
                      style={{
                        textDecoration: 'underline !important',
                        color: filteredRating === star ? '#FF5842 !important' : '#4A4A4A !important'
                      }}
                      onMouseOver={(e) => {
                        if (filteredRating !== star) {
                          e.currentTarget.style.color = '#FF5842 !important';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (filteredRating !== star) {
                          e.currentTarget.style.color = '#4A4A4A !important';
                        }
                      }}
                    >
                      {counts[star]}
                    </a>
                  </div>
                ))}
              </div>
              
              {/* Botão "Ver todos" quando filtro estiver ativo */}
              {filteredRating !== null && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={clearFilter}
                    className="inline-block px-4 py-2 bg-[#FF5842] text-white rounded-full hover:bg-[#d94836] transition"
                  >
                    Ver todos
                  </button>
                </div>
              )}
            </div>
            
            {/* Lista de comentários */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#3A3A3A]">
                {filteredRating !== null 
                  ? `Comentários com ${filteredRating} ${filteredRating === 1 ? 'estrela' : 'estrelas'}`
                  : 'Comentários dos clientes'
                }
              </h3>
              
              {displayedReviews.length > 0 ? (
                <div className="space-y-6">
                  {displayedReviews.map(review => (
                    <div key={review.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-[#FF5842] rounded-full flex items-center justify-center text-white mr-2">
                          {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-[#3A3A3A]">{review.userName}</div>
                          <div className="text-xs text-[#4A4A4A]">{formatDate(review.date)}</div>
                        </div>
                      </div>
                      <div className="flex mb-2">{renderStars(review.rating)}</div>
                      <p className="text-[#3A3A3A]">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#4A4A4A]">
                  {filteredRating !== null 
                    ? `Nenhum comentário com ${filteredRating} ${filteredRating === 1 ? 'estrela' : 'estrelas'}.` 
                    : 'Nenhum comentário disponível.'
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
