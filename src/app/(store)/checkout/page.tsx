'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatNaira } from '@/lib/format';

type Bank = { bank_name: string; account_name: string; account_number: string; narration: string };

const ERRORS: Record<string, string> = {
  insufficient_stock: 'One of your items is no longer available in the quantity you chose. Please update your cart.',
  unavailable: 'One of your items is no longer available. Please update your cart.',
  order_not_payable: 'This order can no longer be paid. Please start again.',
  too_many_requests: 'Too many attempts. Please wait a minute and try again.',
  payment_provider_unavailable: 'The payment service is unavailable. Please try again shortly.',
};

export default function CheckoutPage() {
  const { items, ready, subtotalMinor, clear } = useCart();
  const [f, setF] = useState({ email: '', full_name: '', phone: '', address: '', city: '', state: '' });
  const [method, setMethod] = useState<'paystack' | 'bank_transfer'>('paystack');
  const [fee, setFee] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bank, setBank] = useState<{ order: string; total: number; details: Bank } | null>(null);
  const keyRef = useRef<{ sig: string; key: string } | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (!f.state.trim()) { setFee(null); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/shipping?state=${encodeURIComponent(f.state.trim())}`);
        const j = await r.json();
        setFee(r.ok ? j.fee_minor : null);
      } catch { setFee(null); }
    }, 400);
    return () => clearTimeout(t);
  }, [f.state]);

  // A new idempotency key whenever the cart or method changes, the same key on a double click.
  function idempotencyKey(): string {
    const sig = JSON.stringify([items.map((i) => [i.variantId, i.quantity]), method, f.email.toLowerCase()]);
    if (!keyRef.current || keyRef.current.sig !== sig) keyRef.current = { sig, key: crypto.randomUUID() };
    return keyRef.current.key;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
          customer: { email: f.email, full_name: f.full_name, phone: f.phone },
          shipping: { name: f.full_name, phone: f.phone, address: f.address, city: f.city, state: f.state },
          method,
          idempotency_key: idempotencyKey(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(ERRORS[j.error] ?? 'We could not place your order. Please check your details and try again.');
        setBusy(false);
        return;
      }
      if (method === 'paystack' && j.authorization_url) {
        window.location.href = j.authorization_url; // cart is cleared after payment is confirmed
        return;
      }
      setBank({ order: j.order_number, total: j.total_minor, details: j.bank });
      clear();
    } catch {
      setError('Network problem. Please try again.');
    }
    setBusy(false);
  }

  if (bank) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <h1 className="font-display text-4xl">Order {bank.order} received</h1>
        <p className="mt-4 text-sm">Transfer exactly {formatNaira(bank.total)} to the account below. Your order is confirmed after we verify the payment.</p>
        <dl className="mt-6 space-y-2 border border-ink/15 bg-white p-5 text-sm">
          <div className="flex justify-between"><dt>Bank</dt><dd>{bank.details.bank_name}</dd></div>
          <div className="flex justify-between"><dt>Account name</dt><dd>{bank.details.account_name}</dd></div>
          <div className="flex justify-between"><dt>Account number</dt><dd>{bank.details.account_number}</dd></div>
          <div className="flex justify-between"><dt>Narration</dt><dd>{bank.details.narration}</dd></div>
        </dl>
        <p className="mt-4 text-xs text-ink/60">Your items are reserved for a limited time while we wait for the transfer.</p>
      </main>
    );
  }

  if (!ready) return <main className="mx-auto max-w-5xl px-6 py-16" />;
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="font-display text-4xl">Nothing to check out</h1>
        <Link href="/shop" className="mt-6 inline-block underline">Continue shopping</Link>
      </main>
    );
  }

  const input = 'w-full border border-ink/30 bg-white px-3 py-2 text-sm';
  return (
    <main className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-[1fr_340px]">
      <form onSubmit={submit} className="space-y-4">
        <h1 className="mb-4 font-display text-4xl">Checkout</h1>
        <input className={input} type="email" required placeholder="Email" value={f.email} onChange={set('email')} />
        <input className={input} required placeholder="Full name" value={f.full_name} onChange={set('full_name')} />
        <input className={input} required placeholder="Phone number" value={f.phone} onChange={set('phone')} />
        <input className={input} required placeholder="Delivery address" value={f.address} onChange={set('address')} />
        <div className="grid grid-cols-2 gap-4">
          <input className={input} required placeholder="City" value={f.city} onChange={set('city')} />
          <input className={input} required placeholder="State" value={f.state} onChange={set('state')} />
        </div>
        <fieldset className="space-y-2 pt-2 text-sm">
          <legend className="mb-1 text-xs uppercase tracking-[0.16em]">Payment</legend>
          <label className="flex items-center gap-2"><input type="radio" checked={method === 'paystack'} onChange={() => setMethod('paystack')} /> Card or bank (Paystack)</label>
          <label className="flex items-center gap-2"><input type="radio" checked={method === 'bank_transfer'} onChange={() => setMethod('bank_transfer')} /> Bank transfer (manual verification)</label>
        </fieldset>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full bg-ink px-6 py-3 text-sm uppercase tracking-widest text-ivory disabled:opacity-50">
          {busy ? 'Placing order' : method === 'paystack' ? 'Pay now' : 'Place order'}
        </button>
      </form>

      <aside className="h-fit border border-ink/15 bg-white p-5 text-sm">
        <h2 className="mb-4 text-xs uppercase tracking-[0.16em]">Order summary</h2>
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.variantId} className="flex justify-between gap-3">
              <span>{i.name} x{i.quantity}<br /><span className="text-xs text-ink/60">{i.color} / {i.size}</span></span>
              <span>{formatNaira(i.unitPriceMinor * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-ink/10 pt-4">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatNaira(subtotalMinor)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{fee == null ? 'Enter your state' : formatNaira(fee)}</span></div>
          <div className="flex justify-between font-medium"><span>Total</span><span>{fee == null ? '-' : formatNaira(subtotalMinor + fee)}</span></div>
        </div>
        <p className="mt-3 text-xs text-ink/60">Final prices and stock are confirmed when you place the order.</p>
      </aside>
    </main>
  );
}
