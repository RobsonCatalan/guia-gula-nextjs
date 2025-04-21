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
          Pagina não encontrada. Escolha uma didade para começar
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
    </div>
  );
}
