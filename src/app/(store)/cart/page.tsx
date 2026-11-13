'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatNaira } from '@/lib/format';

export default function CartPage() {
  const { items, ready, subtotalMinor, setQty, remove } = useCart();

  if (!ready) return <main className="mx-auto max-w-3xl px-6 py-16" />;
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <Link href="/shop" className="mt-6 inline-block underline">Continue shopping</Link>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 font-display text-4xl">Your cart</h1>
      <ul className="divide-y divide-ink/10 border-y border-ink/10">
        {items.map((i) => (
          <li key={i.variantId} className="flex items-center justify-between gap-4 py-5">
            <div>
              <Link href={`/product/${i.slug}`} className="text-sm">{i.name}</Link>
              <p className="text-xs text-ink/60">{i.color} / {i.size}</p>
              <button onClick={() => remove(i.variantId)} className="mt-2 text-xs underline">Remove</button>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center border border-ink/30">
                <button className="px-3 py-1" onClick={() => setQty(i.variantId, i.quantity - 1)} aria-label="Decrease quantity">-</button>
                <span className="w-8 text-center text-sm">{i.quantity}</span>
                <button className="px-3 py-1" onClick={() => setQty(i.variantId, i.quantity + 1)} aria-label="Increase quantity">+</button>
              </div>
              <span className="w-24 text-right text-sm">{formatNaira(i.unitPriceMinor * i.quantity)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm">Subtotal</p>
        <p>{formatNaira(subtotalMinor)}</p>
      </div>
      <p className="mt-1 text-xs text-ink/60">Shipping is added at checkout. Prices are confirmed again when you pay.</p>
      <Link href="/checkout" className="mt-6 block bg-ink px-6 py-3 text-center text-sm uppercase tracking-widest text-ivory">Checkout</Link>
    </main>
  );
}
