import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="bg-[#FFF8F0] min-h-screen flex flex-col">
      <header className="bg-[#FF5842] text-white p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image
              src="/images/logo/logo.webp"
              alt="Gula.menu"
              width={150}
              height={50}
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="!text-white hover:text-[#FFF8F0] font-medium">Início</Link>
            <Link href="#" className="!text-white hover:text-[#FFF8F0] font-medium">Cidades</Link>
            <Link href="#" className="!text-white hover:text-[#FFF8F0] font-medium">Culinárias</Link>
            <Link href="#" className="!text-white hover:text-[#FFF8F0] font-medium">Sobre</Link>
          </nav>
          <button className="md:hidden text-2xl text-white">☰</button>
        </div>
      </header>

      <main className="flex-grow py-16 px-6 text-center">
        <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">
          Pagina não encontrada<br/>Escolha uma Cidade para começar
        </h1>
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 max-w-7xl mx-auto">
          {/* Belo Horizonte */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <Image
              src="/images/cities/belo-horizonte.webp"
              alt="Belo Horizonte"
              width={800}
              height={500}
              className="object-cover w-full h-48"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">Belo Horizonte</h3>
              <p className="text-[#4A4A4A] mb-4">Conhecida pelos tradicionais pratos mineiros e pelos diversos bares e botecos.</p>
              <div className="flex justify-end mt-2">
                <Link href="/restaurante/belo-horizonte" className="bg-[#D32F2F] !text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-medium">
                  Ver mais
                </Link>
              </div>
            </div>
          </div>
          {/* São Paulo */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <Image
              src="/images/cities/sao-paulo.webp"
              alt="São Paulo"
              width={800}
              height={500}
              className="object-cover w-full h-48"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">São Paulo</h3>
              <p className="text-[#4A4A4A] mb-4">Maior metrópole do Brasil, famosa pela rica diversidade de culinárias e restaurantes renomados.</p>
              <div className="flex justify-end mt-2">
                <Link href="/restaurante/sao-paulo" className="bg-[#D32F2F] !text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-medium">
                  Ver mais
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-[#FF5842] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Gula.menu</h3>
            <p className="text-sm">
              Seu guia gastronômico completo para encontrar os melhores 
              restaurantes da sua cidade.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="/" className="!text-white hover:!text-[#FFF8F0]">Início</a></li>
              <li><a href="#" className="!text-white hover:!text-[#FFF8F0]">Cidades</a></li>
              <li><a href="#" className="!text-white hover:!text-[#FFF8F0]">Culinárias</a></li>
              <li><a href="#" className="!text-white hover:!text-[#FFF8F0]">Sobre</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contato</h3>
            <p className="text-sm">
              contato@gula.menu<br/>
              São Paulo, SP - Brasil
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-600 text-center text-sm">
          <span className="text-white">&copy; {new Date().getFullYear()} Gula.menu - Todos os direitos reservados</span>
        </div>
      </footer>
    </div>
  );
}
