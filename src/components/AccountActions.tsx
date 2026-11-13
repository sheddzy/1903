'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export default function AccountActions() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function signOut() {
    setBusy(true);
    const { error } = await createClient().auth.signOut();
    if (error) {
      setBusy(false);
      return;
    }
    router.replace('/');
    router.refresh();
  }

  return <button onClick={signOut} disabled={busy} className="border border-ink/25 px-4 py-2 text-xs uppercase tracking-widest disabled:opacity-50">{busy ? 'Signing out…' : 'Sign out'}</button>;
}
