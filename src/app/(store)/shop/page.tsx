import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import { getCategories, listProducts } from '@/lib/catalog';

type Props = { searchParams: Promise<{ filter?: string }> };

export default async function Shop({ searchParams }: Props) {
  const { filter } = await searchParams;
  const f = filter === 'new' || filter === 'best' ? filter : undefined;
  const [products, categories] = await Promise.all([listProducts({ filter: f }), getCategories()]);
  const title = f === 'new' ? 'New Arrivals' : f === 'best' ? 'Best Sellers' : 'Shop All';

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-4xl">{title}</h1>
      <div className="mb-10 mt-5 flex flex-wrap gap-3 text-sm">
        <Link href="/shop" className="border border-ink/30 px-4 py-1.5">All</Link>
        <Link href="/shop?filter=new" className="border border-ink/30 px-4 py-1.5">New</Link>
        <Link href="/shop?filter=best" className="border border-ink/30 px-4 py-1.5">Best sellers</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/category/${c.slug}`} className="border border-ink/30 px-4 py-1.5">{c.name}</Link>
        ))}
      </div>
      <ProductGrid products={products} empty="No products match this view yet." />
    </main>
  );
}
