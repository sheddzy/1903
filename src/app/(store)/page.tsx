import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import ProductGrid from '@/components/ProductGrid';
import NewsletterForm from '@/components/NewsletterForm';
import { getCategories, getSetting, listProducts } from '@/lib/catalog';

export default async function Home() {
  const [newArrivals, bestSellers, categories, promo, story] = await Promise.all([
    listProducts({ filter: 'new', limit: 4 }),
    listProducts({ filter: 'best', limit: 4 }),
    getCategories(),
    getSetting('promo_banner'),
    getSetting('brand_story'),
  ]);
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  return (
    <main>
      {/* Hero */}
      <section className="relative">
        <ProductImage name="Campaign image" ratio="aspect-[4/5] md:aspect-[21/9]" />
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-5 pb-12 text-center">
          <h1 className="font-display text-4xl md:text-6xl">The Collection</h1>
          <div className="flex gap-3">
            <Link href="/shop" className="bg-ink px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory">Shop now</Link>
            <Link href="/collections" className="border border-ink bg-ivory/70 px-8 py-3 text-xs uppercase tracking-[0.2em]">Explore collection</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl">New Arrivals</h2>
          <Link href="/shop?filter=new" className="text-sm underline">View all</Link>
        </div>
        <ProductGrid products={newArrivals} empty="New arrivals will appear here once products are published." />
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <h2 className="mb-8 font-display text-3xl">Featured Collections</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {categories.slice(0, 3).map((c, i) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="group relative block overflow-hidden">
                <ProductImage name={c.name} variant={i + 2} ratio="aspect-[4/5]" className="transition-transform duration-500 group-hover:scale-[1.03]" />
                <span className="absolute bottom-5 left-5 bg-ivory px-4 py-2 text-xs uppercase tracking-[0.2em]">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {promo && (
        <section className="mt-20 bg-cream px-6 py-12 text-center">
          <p className="font-display text-2xl">{promo}</p>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pt-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl">Best Sellers</h2>
          <Link href="/shop?filter=best" className="text-sm underline">View all</Link>
        </div>
        <ProductGrid products={bestSellers} empty="Best sellers will appear here once products are marked in the dashboard." />
      </section>

      {story && (
        <section className="mx-auto mt-20 grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2">
          <ProductImage name="Brand story" variant={3} ratio="aspect-[4/3]" />
          <div>
            <h2 className="font-display text-3xl">About 1903</h2>
            <p className="mt-4 leading-relaxed text-ink/80">{story}</p>
            <Link href="/about" className="mt-6 inline-block text-sm underline">Read more</Link>
          </div>
        </section>
      )}

      <section className="mx-auto mt-24 max-w-7xl px-6 text-center">
        <h2 className="font-display text-3xl">Join the list</h2>
        <p className="mb-6 mt-2 text-sm text-ink/70">New arrivals and news from 1903.</p>
        <NewsletterForm />
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-6">
        <h2 className="mb-6 text-center font-display text-3xl">On Instagram</h2>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((n, i) => (
            <ProductImage key={n} name={`Post ${i + 1}`} variant={i} ratio="aspect-square" />
          ))}
        </div>
        {instagram && (
          <p className="mt-4 text-center text-sm"><a href={instagram} target="_blank" rel="noopener noreferrer" className="underline">Follow on Instagram</a></p>
        )}
      </section>
    </main>
  );
}
