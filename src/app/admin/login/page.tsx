'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError('Sign in failed. Check your details.');
      setBusy(false);
      return;
    }
    window.location.href = '/admin';
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-display text-3xl">1903 Admin</h1>
      <div className="mt-8 space-y-4">
        <input className="w-full border border-ink/30 bg-white px-3 py-2" type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border border-ink/30 bg-white px-3 py-2" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button onClick={signIn} disabled={busy}
          className="w-full bg-ink px-3 py-2 text-ivory disabled:opacity-50">
          {busy ? 'Signing in' : 'Sign in'}
        </button>
      </div>
    </main>
  );
}
