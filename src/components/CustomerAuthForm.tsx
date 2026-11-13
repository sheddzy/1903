'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/browser';

export default function CustomerAuthForm({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const supabase = createClient();

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: name.trim(), phone: phone.trim() },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) {
        setMessage(error.message);
        setBusy(false);
        return;
      }
      if (data.session) {
        window.location.href = '/account';
        return;
      }
      setMessage('Account created. Check your email to confirm your address, then sign in.');
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setMessage('We could not sign you in. Check your email and password.');
      setBusy(false);
      return;
    }
    window.location.href = '/account';
  }

  const input = 'w-full border border-ink/25 bg-white px-3 py-3 text-sm outline-none focus:border-ink';
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="text-[10px] uppercase tracking-[0.25em] text-ink/50">1903 Originals</p>
      <h1 className="mt-3 font-display text-4xl">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-3 text-sm text-ink/65">
        {isRegister ? 'Create an account to keep your orders and delivery details together.' : 'Sign in to view your orders and saved delivery details.'}
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {isRegister && <>
          <input className={input} required maxLength={120} autoComplete="name" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
          <input className={input} required maxLength={20} autoComplete="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
        </>}
        <input className={input} required type="email" autoComplete="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
        <input className={input} required type="password" minLength={8} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="Password (at least 8 characters)" value={password} onChange={e => setPassword(e.target.value)} />
        {message && <p role="status" className="text-sm text-ink/75">{message}</p>}
        <button disabled={busy} className="w-full bg-ink px-5 py-3 text-xs uppercase tracking-[0.18em] text-ivory disabled:opacity-50">
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink/65">
        {isRegister ? 'Already have an account? ' : 'New to 1903 Originals? '}
        <Link className="text-ink underline underline-offset-4" href={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
      </p>
      <Link href="/shop" className="mt-8 inline-block text-xs uppercase tracking-widest underline">Continue shopping</Link>
    </main>
  );
}
