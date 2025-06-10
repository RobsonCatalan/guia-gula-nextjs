import Image from 'next/image';
import { getMenuSections, MenuSection as SectionType } from '@/lib/menuService.server';

interface MenuSectionProps {
  placeId: string;
}

export default async function MenuSection({ placeId }: MenuSectionProps) {
  const sections: SectionType[] = await getMenuSections(placeId);
  return (
    <section className="bg-[#FFF8F0]">
      <div className="max-w-7xl mx-auto px-6 pt-0 pb-12">
        <h2 className="text-2xl font-bold font-['Roboto'] text-[#4A4A4A] mb-4">Cardápio</h2>
        {sections.map((section) => (
          <div key={section.name}>
            <div className="flex items-center mt-6 mb-2 space-x-2">
              <h3 className="text-xl font-semibold text-[#4A4A4A]">{section.name}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {section.items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow flex items-center">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="w-[120px] h-[120px] object-cover rounded"
                      unoptimized
                    />
                  )}
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-bold text-[#4A4A4A]">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-[#4A4A4A]">{item.description}</p>
                    )}
                    <p className="text-sm font-semibold text-[#4A4A4A] mt-1 text-left">
                      R$ {(item.price / 100).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
