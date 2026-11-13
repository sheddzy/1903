import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { getCategories } from '@/lib/catalog';

export default async function Collections() {
  const categories = await getCategories();
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-10 font-display text-4xl">Collections</h1>
      {categories.length === 0 ? (
        <p className="text-sm text-ink/60">Collections will appear here once categories are created.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="group relative block overflow-hidden">
              <ProductImage name={c.name} variant={i} ratio="aspect-[4/5]" className="transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className="absolute bottom-5 left-5 bg-ivory px-4 py-2 text-xs uppercase tracking-[0.2em]">{c.name}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
