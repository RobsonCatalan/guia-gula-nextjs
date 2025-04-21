import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  const cities = [
    { slug: 'belo-horizonte', label: 'Belo Horizonte' },
    { slug: 'sao-paulo', label: 'São Paulo' }
  ];

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
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {cities.map((c) => (
            <Link
              key={c.slug}
              href={`/restaurante/${c.slug}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block"
            >
              <span className="text-xl font-semibold text-[#FF5842]">{c.label}</span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
