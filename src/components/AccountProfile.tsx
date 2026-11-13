'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

export default function AccountProfile({ initialName, initialPhone, email }: { initialName: string; initialPhone: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const { error } = await createClient().auth.updateUser({ data: { full_name: name.trim(), phone: phone.trim() } });
    setMessage(error ? 'Your details could not be saved. Please try again.' : 'Your details have been updated.');
    setBusy(false);
  }

  const input = 'mt-1 w-full border border-ink/25 bg-white px-3 py-2 text-sm';
  return (
    <form onSubmit={save} className="space-y-3 border border-ink/15 bg-white p-4">
      <label className="block text-xs">Full name<input className={input} required maxLength={120} value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="block text-xs">Email address<input className={input + ' bg-ivory/60'} readOnly value={email} /></label>
      <label className="block text-xs">Phone number<input className={input} maxLength={20} value={phone} onChange={e => setPhone(e.target.value)} /></label>
      {message && <p role="status" className="text-xs text-ink/70">{message}</p>}
      <button disabled={busy} className="bg-ink px-4 py-2 text-xs uppercase tracking-widest text-ivory disabled:opacity-50">{busy ? 'Saving…' : 'Save details'}</button>
    </form>
  );
}
