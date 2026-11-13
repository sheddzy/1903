import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import ProductPurchase from '@/components/ProductPurchase';
import ProductGrid from '@/components/ProductGrid';
import { activeVariants, getProduct, listProducts, unitPrice } from '@/lib/catalog';
import { formatNaira } from '@/lib/format';
import { imageUrl } from '@/lib/images';

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();

  const related = p.category
    ? await listProducts({ categorySlug: p.category.slug, excludeId: p.id, limit: 4 })
    : [];
  const urls = [...p.images].sort((a, b) => a.sort_order - b.sort_order).map((i) => imageUrl(i.storage_path));

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <p className="mb-6 text-xs uppercase tracking-[0.16em] text-ink/60">
        <Link href="/shop">Shop</Link>
        {p.category && <> / <Link href={`/category/${p.category.slug}`}>{p.category.name}</Link></>}
      </p>
      <div className="grid gap-12 md:grid-cols-2">
        <ProductGallery name={p.name} urls={urls} />
        <div>
          <h1 className="font-display text-4xl">{p.name}</h1>
          <p className="mt-3 text-lg">
            {p.discount_price_minor != null ? (
              <>
                {formatNaira(p.discount_price_minor)}{' '}
                <span className="text-ink/50 line-through">{formatNaira(p.price_minor)}</span>
              </>
            ) : formatNaira(p.price_minor)}
          </p>
          {p.description && <p className="mt-5 leading-relaxed text-ink/80">{p.description}</p>}
          <div className="mt-8">
            <ProductPurchase
              product={{ id: p.id, slug: p.slug, name: p.name, unitPriceMinor: unitPrice(p) }}
              variants={activeVariants(p)}
            />
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-display text-3xl">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </main>
  );
}
