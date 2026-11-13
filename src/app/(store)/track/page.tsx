'use client';
import { useState } from 'react';

type Tracking = {
  order_number: string;
  order_status: string;
  delivery_status: string | null;
  courier_name: string | null;
  tracking_reference: string | null;
  expected_delivery_date: string | null;
  timeline: { status: string; at: string }[];
};

const label = (s: string) => s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

export default function TrackPage() {
  const [order, setOrder] = useState('');
  const [email, setEmail] = useState('');
  const [data, setData] = useState<Tracking | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null); setData(null);
    try {
      const r = await fetch(`/api/track?order=${encodeURIComponent(order)}&email=${encodeURIComponent(email)}`);
      if (r.ok) setData(await r.json());
      else if (r.status === 404) setMsg('We could not find an order with those details.');
      else if (r.status === 429) setMsg('Too many attempts. Please wait a minute.');
      else setMsg('Something went wrong. Please try again.');
    } catch { setMsg('Network problem. Please try again.'); }
    setBusy(false);
  }

  const input = 'w-full border border-ink/30 bg-white px-3 py-2 text-sm';
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-4xl">Track your order</h1>
      <form onSubmit={lookup} className="mt-8 space-y-4">
        <input className={input} required placeholder="Order number (e.g. 1903-001001)" value={order} onChange={(e) => setOrder(e.target.value)} />
        <input className={input} type="email" required placeholder="Email used at checkout" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button disabled={busy} className="w-full bg-ink px-6 py-3 text-sm uppercase tracking-widest text-ivory disabled:opacity-50">Track</button>
      </form>
      {msg && <p className="mt-6 text-sm">{msg}</p>}
      {data && (
        <div className="mt-8 space-y-4 text-sm">
          <p>Order {data.order_number}: <strong>{label(data.order_status)}</strong></p>
          {data.delivery_status && <p>Delivery: {label(data.delivery_status)}</p>}
          {data.courier_name && <p>Courier: {data.courier_name}{data.tracking_reference ? ` (${data.tracking_reference})` : ''}</p>}
          {data.expected_delivery_date && <p>Expected: {data.expected_delivery_date}</p>}
          {data.timeline.length > 0 && (
            <ol className="space-y-2 border-l border-ink/20 pl-4">
              {data.timeline.map((t, i) => (
                <li key={i}>{label(t.status)} <span className="text-ink/50">{new Date(t.at).toLocaleString('en-NG')}</span></li>
              ))}
            </ol>
          )}
        </div>
      )}
    </main>
  );
}
