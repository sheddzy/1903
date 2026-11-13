'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Order = { id: string; order_number: string; customer_name: string; total_minor: number; status: string; created_at: string };
const money = (minor: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(minor / 100);

export default function OrderManager() {
  const [orders,setOrders] = useState<Order[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders',{cache:'no-store'});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not load orders.');
      setOrders(data.orders ?? []); setError('');
    } catch(e) { setError(e instanceof Error ? e.message : 'Could not load orders.'); }
    finally { setLoading(false); }
  }
  useEffect(()=>{void load();},[]);
  const pending = orders.filter(o=>o.status==='pending_payment').length;
  return <main className="min-h-screen bg-[#F7F5F0]">
    <header className="border-b border-ink/10 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <div><p className="text-[10px] uppercase tracking-[0.25em] text-ink/50">1903 Originals</p><h1 className="mt-1 font-display text-3xl">Orders</h1></div>
      <div className="flex gap-3"><Link href="/admin" className="border border-ink/20 px-4 py-2 text-xs uppercase tracking-wider">Dashboard</Link><Link href="/admin/inventory" className="border border-ink/20 px-4 py-2 text-xs uppercase tracking-wider">Inventory</Link></div>
    </div></header>
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="border border-ink/10 bg-white p-5"><p className="text-xs text-ink/55">Total orders</p><p className="mt-2 font-display text-3xl">{orders.length}</p></div>
        <div className="border border-ink/10 bg-white p-5"><p className="text-xs text-ink/55">Awaiting payment</p><p className="mt-2 font-display text-3xl">{pending}</p></div>
        <div className="border border-ink/10 bg-white p-5"><p className="text-xs text-ink/55">Paid / processing</p><p className="mt-2 font-display text-3xl">{orders.filter(o=>!['pending_payment','cancelled','failed'].includes(o.status)).length}</p></div>
      </div>
      {error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <section className="border border-ink/10 bg-white">
        <div className="flex items-center justify-between border-b border-ink/10 p-5"><div><h2 className="font-display text-2xl">All orders</h2><p className="mt-1 text-xs text-ink/55">Newest orders appear first. This first release is read-only to protect payment and fulfilment records.</p></div><button onClick={()=>void load()} className="text-xs underline">Refresh</button></div>
        {loading ? <p className="p-6 text-sm">Loading orders…</p> : orders.length===0 ? <p className="p-6 text-sm text-ink/55">No orders received yet.</p> : <div className="divide-y divide-ink/10">
          {orders.map(o=><article key={o.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <div><p className="text-sm">{o.order_number}</p><p className="mt-1 text-xs text-ink/55">{o.customer_name} · {new Date(o.created_at).toLocaleString('en-NG')}</p></div>
            <p className="text-sm">{money(o.total_minor)}</p>
            <span className="w-fit border border-ink/15 px-3 py-1 text-[10px] uppercase tracking-wider">{o.status.replaceAll('_',' ')}</span>
          </article>)}
        </div>}
      </section>
    </div>
  </main>;
}
