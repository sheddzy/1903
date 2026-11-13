"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/catalog-utils';
import { formatNaira } from '@/lib/format';
import { imageUrl } from '@/lib/images';

const DISMISS_KEY = '1903-new-arrivals-dismissed-at';
const COOLDOWN_MS = 12 * 60 * 60 * 1000;

export default function NewArrivalsPopup({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const featured = useMemo(() => products[selectedIndex] ?? products[0], [products, selectedIndex]);
  const firstImage = featured?.images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0];

  useEffect(() => {
    if (!products.length) return;
    try {
      const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < COOLDOWN_MS) return;
      setSelectedIndex(Math.floor(Math.random() * products.length));
      const timer = window.setTimeout(() => setOpen(true), 6500);
      return () => window.clearTimeout(timer);
    } catch {
      const timer = window.setTimeout(() => setOpen(true), 6500);
      return () => window.clearTimeout(timer);
    }
  }, [products.length]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // The popup still closes when browser storage is unavailable.
    }
  }

  if (!open || !featured) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) dismiss();
    }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-arrivals-title"
        className="relative grid w-full max-w-2xl overflow-hidden bg-ivory shadow-2xl sm:grid-cols-2"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close new arrivals"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center bg-ivory/90 text-xl text-ink hover:bg-white"
        >
          ×
        </button>
        <div className="aspect-[4/5] bg-cream sm:aspect-auto">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl(firstImage.storage_path)} alt={featured.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center p-8 text-center font-display text-3xl text-ink/50">{featured.name}</div>
          )}
        </div>
        <div className="flex flex-col justify-center px-7 py-10 sm:px-9">
          <p className="text-[10px] uppercase tracking-[0.28em] text-ink/60">Just added to the collection</p>
          <h2 id="new-arrivals-title" className="mt-4 font-display text-4xl leading-tight">New Arrivals</h2>
          <p className="mt-5 text-sm text-ink/70">Meet the latest from 1903 Originals.</p>
          <p className="mt-6 text-base">{featured.name}</p>
          <p className="mt-1 text-sm text-ink/70">
            {formatNaira(featured.discount_price_minor ?? featured.price_minor)}
          </p>
          <Link href={`/product/${featured.slug}`} onClick={dismiss} className="mt-7 bg-ink px-6 py-4 text-center text-[10px] uppercase tracking-[0.22em] text-ivory transition-opacity hover:opacity-80">
            Shop this arrival
          </Link>
          <Link href="/shop?filter=new" onClick={dismiss} className="mt-4 text-center text-xs underline underline-offset-4">
            View all new arrivals
          </Link>
        </div>
      </section>
    </div>
  );
}
