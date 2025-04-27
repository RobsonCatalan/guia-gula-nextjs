import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#FF5842] text-white py-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Gula.menu</h3>
          <p className="text-sm">
            Seu guia gastronômico completo para encontrar os melhores restaurantes da sua cidade.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://www.gulamenu.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="!text-white hover:!text-[#FFF8F0]"
              >
                Para Restaurantes
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Contato</h3>
          <p className="text-sm">
            contato@gula.menu<br />São Paulo, SP - Brasil
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-600 text-center text-sm">
        <span className="text-white">
          &copy; {new Date().getFullYear()} Gula.menu - Todos os direitos reservados
        </span>
      </div>
    </footer>
  );
}
