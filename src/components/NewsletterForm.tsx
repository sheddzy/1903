'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') return <p className="text-sm">Thank you. You are on the list.</p>;
  return (
    <form onSubmit={submit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address" className="flex-1 border border-ink/30 bg-white px-4 py-3 text-sm" />
      <button disabled={state === 'busy'} className="bg-ink px-6 py-3 text-sm uppercase tracking-widest text-ivory disabled:opacity-50">
        Subscribe
      </button>
      {state === 'error' && <p className="text-sm text-red-700 sm:basis-full">Something went wrong. Please try again.</p>}
    </form>
  );
}
