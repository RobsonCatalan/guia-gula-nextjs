'use client';

import React from 'react';

const categories = [
  'Bar & Pub',
  'Pizzaria',
  'Café & Pães & Doces',
  'Lanches & Burgers',
  'Churrasco & Grelhados',
  'Pastelaria',
  'Japonês',
  'Italiano',
  'Mineiro',
  'Árabe',
  'Self-service & Buffet',
  'Frutos do Mar',
  'Mexicano',
  'Wine Bar',
  'Chinês',
  'Português',
  'Vegano & Vegetariano',
  'Brasileiro',
  'Francês',
  'Peruano',
  'Espanhol',
  'Alemão',
  'Indiano',
  'Internacional',
  'Saudável & Sucos',
  'Quiosques & Barracas',
  'Empório & Delicatessen',
  'Outros'
];

export default function CategorySection() {
  return (
    <section className="py-12 px-6 bg-[#FFF8F0]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold font-['Roboto'] text-[#4A4A4A] mb-6">Categorias</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center"
            >
              <span className="text-[#D32F2F] font-medium">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
