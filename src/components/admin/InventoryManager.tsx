'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Variant = {
  id: string; product_id: string; size: string; color: string;
  stock_on_hand: number; reserved_qty: number; is_active: boolean;
  products: { name: string; slug: string } | null;
};

export default function InventoryManager() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/inventory', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not load inventory.');
      setVariants(data.variants ?? []);
      setDrafts(Object.fromEntries((data.variants ?? []).map((v: Variant) => [v.id, String(v.stock_on_hand)])));
      setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load inventory.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function save(v: Variant) {
    const quantity = Number(drafts[v.id]);
    if (!Number.isInteger(quantity) || quantity < v.reserved_qty) {
      setError('Enter a whole number equal to or greater than reserved stock.');
      return;
    }
    setBusy(v.id); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: v.id, stock_on_hand: quantity }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Stock update failed.');
      setMessage(data.message); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Stock update failed.'); }
    finally { setBusy(null); }
  }

  const available = (v: Variant) => Math.max(0, v.stock_on_hand - v.reserved_qty);
  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <header className="border-b border-ink/10 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div><p className="text-[10px] uppercase tracking-[0.25em] text-ink/50">1903 Originals</p><h1 className="mt-1 font-display text-3xl">Inventory</h1></div>
        <div className="flex gap-3"><Link href="/admin" className="border border-ink/20 px-4 py-2 text-xs uppercase tracking-wider">Dashboard</Link><Link href="/admin/products" className="border border-ink/20 px-4 py-2 text-xs uppercase tracking-wider">Products</Link></div>
      </div></header>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="border border-ink/10 bg-white p-5"><p className="text-xs text-ink/55">Tracked variants</p><p className="mt-2 font-display text-3xl">{variants.length}</p></div>
          <div className="border border-ink/10 bg-white p-5"><p className="text-xs text-ink/55">Units in stock</p><p className="mt-2 font-display text-3xl">{variants.reduce((n,v)=>n+v.stock_on_hand,0)}</p></div>
          <div className="border border-ink/10 bg-white p-5"><p className="text-xs text-ink/55">Low stock (2 or fewer)</p><p className="mt-2 font-display text-3xl">{variants.filter(v=>v.is_active && available(v)<=2).length}</p></div>
        </div>
        {error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {message && <p role="status" className="mb-4 border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</p>}
        <section className="border border-ink/10 bg-white">
          <div className="flex items-center justify-between border-b border-ink/10 p-5"><div><h2 className="font-display text-2xl">Stock by variant</h2><p className="mt-1 text-xs text-ink/55">Edit the physical stock count. Reserved units cannot be removed.</p></div><button onClick={()=>void load()} className="text-xs underline">Refresh</button></div>
          {loading ? <p className="p-6 text-sm">Loading inventory…</p> : variants.length===0 ? <p className="p-6 text-sm text-ink/55">No product variants found. Add products and variants first.</p> : <div className="divide-y divide-ink/10">
            {variants.map(v=><div key={v.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center">
              <div><p className="text-sm">{v.products?.name ?? 'Unknown product'}</p><p className="mt-1 text-xs text-ink/50">{v.size} · {v.color} { !v.is_active && '· Inactive' }</p></div>
              <div className="text-xs"><span className="text-ink/50">Reserved</span><p className="mt-1 text-sm">{v.reserved_qty}</p></div>
              <div className="text-xs"><span className="text-ink/50">Available</span><p className={'mt-1 text-sm '+(available(v)<=2?'text-red-700':'')}>{available(v)}</p></div>
              <label className="text-xs text-ink/55">Physical stock<input aria-label={'Physical stock for '+(v.products?.name ?? 'product')} type="number" min={v.reserved_qty} step="1" value={drafts[v.id] ?? ''} onChange={e=>setDrafts(d=>({...d,[v.id]:e.target.value}))} className="mt-1 block w-24 border border-ink/20 px-2 py-2 text-sm text-ink" /></label>
              <button disabled={busy===v.id || Number(drafts[v.id])===v.stock_on_hand} onClick={()=>void save(v)} className="border border-ink/20 px-3 py-2 text-[10px] uppercase tracking-wider disabled:opacity-40">{busy===v.id?'Saving…':'Save stock'}</button>
            </div>)}
          </div>}
        </section>
      </div>
    </main>
  );
}
