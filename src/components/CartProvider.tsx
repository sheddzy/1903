'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  unitPriceMinor: number; // display only: the server re-prices at checkout
  quantity: number;
};

type Ctx = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotalMinor: number;
  add: (item: Omit<CartItem, 'quantity'>, qty: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const KEY = '1903_cart';
const MAX_QTY = 10;
const CartContext = createContext<Ctx | null>(null);

function valid(i: unknown): i is CartItem {
  const x = i as CartItem;
  return !!x && typeof x.variantId === 'string' && typeof x.name === 'string'
    && typeof x.unitPriceMinor === 'number' && Number.isInteger(x.quantity) && x.quantity > 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter(valid));
      }
    } catch { /* storage unavailable: start empty */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, 'quantity'>, qty: number) => {
    setItems((prev) => {
      const found = prev.find((p) => p.variantId === item.variantId);
      if (found) {
        return prev.map((p) =>
          p.variantId === item.variantId ? { ...p, quantity: Math.min(MAX_QTY, p.quantity + qty) } : p);
      }
      return [...prev, { ...item, quantity: Math.min(MAX_QTY, qty) }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty < 1 ? prev.filter((p) => p.variantId !== id)
              : prev.map((p) => (p.variantId === id ? { ...p, quantity: Math.min(MAX_QTY, qty) } : p)));
  }, []);
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((p) => p.variantId !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Ctx>(() => ({
    items, ready,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotalMinor: items.reduce((n, i) => n + i.quantity * i.unitPriceMinor, 0),
    add, setQty, remove, clear,
  }), [items, ready, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Ctx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
