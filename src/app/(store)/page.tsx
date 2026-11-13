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
      {/* Editorial hero: avoids showing a fake campaign image before brand photography is uploaded. */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-6 py-20 md:min-h-[620px] md:grid-cols-[1.2fr_0.8fr] md:px-10">
          <div className="max-w-2xl">
            <p className="mb-5 text-[11px] uppercase tracking-[0.28em] text-ink/60">1903 Originals</p>
            <h1 className="font-display text-6xl leading-[0.95] md:text-8xl">The Collection<span className="text-ink/40">.</span></h1>
            <p className="mt-7 max-w-md text-sm leading-7 text-ink/70 md:text-base">Explore the latest pieces from 1903.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="bg-ink px-8 py-4 text-xs uppercase tracking-[0.2em] text-ivory transition-opacity hover:opacity-80">Shop now</Link>
              <Link href="/collections" className="border border-ink px-8 py-4 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-ivory">Explore collections</Link>
            </div>
          </div>
          <div className="hidden h-full min-h-[360px] items-center justify-center border border-ink/10 md:flex">
            <span className="font-display text-[clamp(8rem,18vw,16rem)] leading-none tracking-[-0.12em] text-ink/10">03</span>
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
              <Link key={c.id} href={`/category/${c.slug}`} className="group flex aspect-[4/5] items-end justify-between overflow-hidden bg-cream p-6 transition-colors hover:bg-[#E8E0D2]">
                <span className="font-display text-3xl md:text-4xl">{c.name}</span>
                <span className="text-xs uppercase tracking-[0.2em] transition-transform group-hover:translate-x-1">Explore ↗</span>
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

      {instagram && (
        <section className="mx-auto mt-24 max-w-7xl px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-ink/60">Follow the brand</p>
          <h2 className="mt-3 font-display text-4xl">1903 on Instagram</h2>
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block border-b border-ink pb-1 text-xs uppercase tracking-[0.2em]">Follow @1903</a>
        </section>
      )}
    </main>
  );
}
