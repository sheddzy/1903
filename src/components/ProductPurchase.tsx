'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { availableQty, sortSizes, type Variant } from '@/lib/catalog-utils';

type Props = {
  product: { id: string; slug: string; name: string; unitPriceMinor: number };
  variants: Variant[];
};

export default function ProductPurchase({ product, variants }: Props) {
  const router = useRouter();
  const cart = useCart();

  const sizes = useMemo(() => sortSizes([...new Set(variants.map((v) => v.size))]), [variants]);
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);

  const firstInStock = variants.find((v) => availableQty(v) > 0) ?? variants[0];
  const [size, setSize] = useState(firstInStock?.size ?? '');
  const [color, setColor] = useState(firstInStock?.color ?? '');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const find = (s: string, c: string) => variants.find((v) => v.size === s && v.color === c);
  const selected = find(size, color);
  const avail = selected ? availableQty(selected) : 0;
  const maxQty = Math.max(1, Math.min(10, avail));
  const canBuy = !!selected && avail > 0;

  function addToCart() {
    if (!selected || !canBuy) return false;
    cart.add({
      variantId: selected.id, productId: product.id, slug: product.slug, name: product.name,
      size: selected.size, color: selected.color, unitPriceMinor: product.unitPriceMinor,
    }, Math.min(qty, maxQty));
    return true;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.16em]">Colour: {color}</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button key={c} onClick={() => { setColor(c); setQty(1); setAdded(false); }}
              className={`border px-4 py-2 text-sm ${c === color ? 'border-ink bg-ink text-ivory' : 'border-ink/30'}`}>{c}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.16em]">Size: {size}</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const v = find(s, color);
            const out = !v || availableQty(v) <= 0;
            return (
              <button key={s} onClick={() => { setSize(s); setQty(1); setAdded(false); }}
                className={`min-w-12 border px-4 py-2 text-sm ${s === size ? 'border-ink bg-ink text-ivory' : 'border-ink/30'} ${out ? 'text-ink/35 line-through' : ''}`}>
                {s}
              </button>
            );
          })}
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer underline">Size guide</summary>
          <table className="mt-3 w-full max-w-sm text-left text-xs">
            <thead><tr><th className="py-1">Size</th><th>Bust (cm)</th><th>Waist (cm)</th><th>Hip (cm)</th></tr></thead>
            <tbody>
              <tr><td className="py-1">S</td><td>82-86</td><td>64-68</td><td>90-94</td></tr>
              <tr><td className="py-1">M</td><td>88-92</td><td>70-74</td><td>96-100</td></tr>
              <tr><td className="py-1">L</td><td>94-98</td><td>76-80</td><td>102-106</td></tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs text-ink/60">Demo values. Replace with 1903&apos;s real size chart.</p>
        </details>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-ink/30">
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">-</button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Increase quantity">+</button>
        </div>
        <p className="text-sm">
          {!selected ? 'Unavailable' : avail <= 0 ? 'Sold out' : avail <= 3 ? 'Low stock' : 'In stock'}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button disabled={!canBuy} onClick={() => setAdded(addToCart())}
          className="flex-1 border border-ink px-6 py-3 text-sm uppercase tracking-widest disabled:opacity-40">
          Add to cart
        </button>
        <button disabled={!canBuy} onClick={() => { if (addToCart()) router.push('/checkout'); }}
          className="flex-1 bg-ink px-6 py-3 text-sm uppercase tracking-widest text-ivory disabled:opacity-40">
          Buy now
        </button>
      </div>
      {added && <p className="text-sm">Added to your cart. <a href="/cart" className="underline">View cart</a></p>}
    </div>
  );
}
