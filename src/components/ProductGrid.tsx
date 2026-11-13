import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/catalog-utils';

export default function ProductGrid({ products, empty = 'No products yet.' }: { products: Product[]; empty?: string }) {
  if (products.length === 0) return <p className="py-10 text-sm text-ink/60">{empty}</p>;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
