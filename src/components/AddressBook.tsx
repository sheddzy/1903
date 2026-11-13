'use client';

import { useEffect, useState } from 'react';

type Address = {
  id: string; label: string; recipient_name: string; phone: string;
  address_line1: string; address_line2: string | null; city: string; state: string;
  postal_code: string | null; is_default: boolean;
};

const empty = { label: 'Home', recipient_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', is_default: false };
const input = 'w-full border border-ink/25 bg-white px-3 py-2 text-sm';

export default function AddressBook() {
  const [rows, setRows] = useState<Address[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/account/addresses', { cache: 'no-store' });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Could not load addresses');
    setRows(d.addresses || []);
  }

  useEffect(() => { void load().catch(() => setMessage('Could not load your saved addresses.')); }, []);

  function startEdit(a: Address) {
    setEditing(a.id);
    setForm({ label: a.label, recipient_name: a.recipient_name, phone: a.phone, address_line1: a.address_line1, address_line2: a.address_line2 || '', city: a.city, state: a.state, postal_code: a.postal_code || '', is_default: a.is_default });
    setMessage('');
  }

  function reset() { setEditing(null); setForm(empty); }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const r = await fetch('/api/account/addresses', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { id: editing, address: form } : form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not save address');
      await load(); reset(); setMessage('Address saved.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not save address'); }
    setBusy(false);
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this saved address?')) return;
    setBusy(true); setMessage('');
    try {
      const r = await fetch('/api/account/addresses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not delete address');
      await load(); if (editing === id) reset(); setMessage('Address deleted.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not delete address'); }
    setBusy(false);
  }

  const field = (key: keyof typeof empty, label: string, required = true) => (
    <label className="block text-xs">{label}
      <input className={input + ' mt-1'} required={required} maxLength={key === 'address_line1' || key === 'address_line2' ? 250 : 120}
        value={String(form[key])} onChange={e => setForm({ ...form, [key]: e.target.value })} />
    </label>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <section className="space-y-3">
        {rows.length ? rows.map(a => (
          <article key={a.id} className="border border-ink/15 bg-white p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <strong>{a.label}</strong>
              {a.is_default && <span className="text-[10px] uppercase tracking-widest">Default</span>}
            </div>
            <p className="mt-2">{a.recipient_name} · {a.phone}</p>
            <p className="text-ink/65">{a.address_line1}{a.address_line2 ? ', ' + a.address_line2 : ''}, {a.city}, {a.state}{a.postal_code ? ', ' + a.postal_code : ''}</p>
            <div className="mt-4 flex gap-4 text-xs"><button onClick={() => startEdit(a)} className="underline">Edit</button><button disabled={busy} onClick={() => void remove(a.id)} className="underline">Delete</button></div>
          </article>
        )) : <p className="border border-ink/15 bg-white p-5 text-sm text-ink/60">No saved addresses yet.</p>}
      </section>
      <form onSubmit={save} className="space-y-3 border border-ink/15 bg-white p-5">
        <h2 className="font-display text-2xl">{editing ? 'Edit address' : 'Add an address'}</h2>
        <div className="grid grid-cols-2 gap-3">
          {field('label', 'Address label')}
          <label className="flex items-center gap-2 self-end pb-2 text-xs"><input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} /> Make default</label>
        </div>
        {field('recipient_name', 'Recipient name')}
        {field('phone', 'Phone number')}
        {field('address_line1', 'Street address')}
        {field('address_line2', 'Apartment, suite, landmark (optional)', false)}
        <div className="grid grid-cols-2 gap-3">{field('city', 'City')}{field('state', 'State')}</div>
        {field('postal_code', 'Postal code (optional)', false)}
        {message && <p role="status" className="text-xs text-ink/70">{message}</p>}
        <div className="flex gap-3"><button disabled={busy} className="bg-ink px-4 py-3 text-xs uppercase tracking-widest text-ivory disabled:opacity-50">{busy ? 'Saving…' : editing ? 'Update address' : 'Save address'}</button>{editing && <button type="button" onClick={reset} className="border border-ink/25 px-4 py-3 text-xs uppercase tracking-widest">Cancel</button>}</div>
      </form>
    </div>
  );
}
