import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { formatNaira } from '@/lib/format';
import { imageUrl } from '@/lib/images';
import { isSoldOut, type Product } from '@/lib/catalog-utils';

export default function ProductCard({ product: p }: { product: Product }) {
  const first = [...p.images].sort((a, b) => a.sort_order - b.sort_order)[0];
  const soldOut = isSoldOut(p);
  const badge = soldOut ? 'Sold out' : p.is_preorder ? 'Pre-order' : p.is_new_arrival ? 'New' : p.is_best_seller ? 'Best seller' : null;

  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="relative overflow-hidden">
        <ProductImage src={first ? imageUrl(first.storage_path) : null} name={p.name}
          className="transition-transform duration-500 group-hover:scale-[1.03]" />
        {badge && (
          <span className="absolute right-3 top-3 bg-ivory px-2 py-1 text-[10px] uppercase tracking-[0.16em]">{badge}</span>
        )}
      </div>
      <h3 className="mt-3 text-sm">{p.name}</h3>
      <p className="mt-1 text-sm">
        {p.discount_price_minor != null ? (
          <>
            <span>{formatNaira(p.discount_price_minor)}</span>{' '}
            <span className="text-ink/50 line-through">{formatNaira(p.price_minor)}</span>
          </>
        ) : formatNaira(p.price_minor)}
      </p>
    </Link>
  );
}
