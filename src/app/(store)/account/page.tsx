import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AccountActions from '@/components/AccountActions';
import AccountProfile from '@/components/AccountProfile';

export const dynamic = 'force-dynamic';

type Order = {
  id: string;
  order_number: string;
  total_minor: number;
  status: string;
  created_at: string;
};

type Address = {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  is_default: boolean;
};

const pretty = (value: string) => value.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
const money = (minor: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(minor / 100);

export default async function CustomerAccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/account');

  const [{ data: orders, error: ordersError }, { data: addresses, error: addressesError }] = await Promise.all([
    supabase.from('orders').select('id,order_number,total_minor,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
    supabase.from('customer_addresses').select('id,label,recipient_name,phone,address_line1,address_line2,city,state,postal_code,is_default').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false }),
  ]);

  const fullName = String(user.user_metadata?.full_name ?? '');
  const phone = String(user.user_metadata?.phone ?? '');

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/15 pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-ink/50">1903 Originals</p>
          <h1 className="mt-2 font-display text-4xl">My account</h1>
          <p className="mt-2 text-sm text-ink/65">Welcome{fullName ? `, ${fullName}` : ''}. Manage your details and orders.</p>
        </div>
        <AccountActions />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="space-y-8">
          <div>
            <h2 className="mb-4 font-display text-2xl">Personal details</h2>
            <AccountProfile initialName={fullName} initialPhone={phone} email={user.email ?? ''} />
          </div>
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl">Delivery addresses</h2>
              <Link href="/account/addresses" className="text-xs underline">Manage</Link>
            </div>
            {addressesError ? <p className="text-sm text-ink/60">Address storage needs to be enabled before this section can be used.</p> :
              (addresses as Address[] | null)?.length ? (
                <div className="space-y-3">{(addresses as Address[]).slice(0, 3).map(a => (
                  <article key={a.id} className="border border-ink/15 bg-white p-4 text-sm">
                    <div className="flex justify-between gap-2"><strong>{a.label}</strong>{a.is_default && <span className="text-[10px] uppercase tracking-widest">Default</span>}</div>
                    <p className="mt-2">{a.recipient_name} · {a.phone}</p>
                    <p className="text-ink/65">{a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}, {a.city}, {a.state}{a.postal_code ? `, ${a.postal_code}` : ''}</p>
                  </article>
                ))}</div>
              ) : <p className="text-sm text-ink/60">No saved addresses yet.</p>}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl">Order history</h2>
          {ordersError ? <p className="border border-ink/15 bg-white p-5 text-sm">Your order history could not be loaded. Your orders are still available through <Link className="underline" href="/track">order tracking</Link>.</p> :
            (orders as Order[] | null)?.length ? (
              <div className="divide-y divide-ink/10 border-y border-ink/15">
                {(orders as Order[]).map(order => (
                  <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                    <div>
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="mt-1 text-xs text-ink/55">{new Date(order.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })} · {pretty(order.status)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{money(order.total_minor)}</p>
                      <Link href="/track" className="mt-1 inline-block text-xs underline">Track order</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : <div className="border border-ink/15 bg-white p-6"><p className="text-sm">You have no orders linked to this account yet.</p><Link href="/shop" className="mt-4 inline-block text-xs uppercase tracking-widest underline">Explore the collection</Link></div>}
        </section>
      </div>
    </main>
  );
}
