import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/auth';
import { formatNaira } from '@/lib/format';

export const dynamic = 'force-dynamic';

function Stat({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="border border-ink/10 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-ink/55">{label}</p>
      <p className="mt-3 font-display text-4xl">{value}</p>
      <p className="mt-2 text-xs text-ink/50">{note}</p>
    </div>
  );
}

function statusLabel(status: string) {
  return status.replaceAll('_', ' ');
}

export default async function AdminHome() {
  const staff = await requireStaff();
  if (!staff) redirect('/admin/login');

  const db = adminClient();
  const [
    products, categories, orders, awaiting, customers, variants, recent,
  ] = await Promise.all([
    db.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    db.from('product_categories').select('id', { count: 'exact', head: true }).eq('is_active', true),
    db.from('orders').select('id', { count: 'exact', head: true }),
    db.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending_payment'),
    db.from('customers').select('id', { count: 'exact', head: true }),
    db.from('product_variants').select('stock_on_hand,reserved_qty').eq('is_active', true),
    db.from('orders').select('id,order_number,customer_name,total_minor,status,created_at')
      .order('created_at', { ascending: false }).limit(6),
  ]);

  const lowStock = (variants.data ?? []).filter(
    (v) => Math.max(0, v.stock_on_hand - v.reserved_qty) <= 2
  ).length;
  const dataErrors = [products, categories, orders, awaiting, customers, variants, recent]
    .filter((r) => r.error).map((r) => r.error?.message);

  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-ink/50">1903 Originals</p>
            <h1 className="mt-1 font-display text-3xl">Admin dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-ink/50 sm:inline">{staff.role}</span>
            <Link href="/" className="border border-ink/20 px-4 py-2 text-xs uppercase tracking-wider">View store</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-ink/60">Store overview</p>
          <h2 className="mt-1 font-display text-2xl">Your store at a glance</h2>
        </div>

        {dataErrors.length > 0 && (
          <div className="mb-6 border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            Some dashboard data could not be loaded: {dataErrors.join(' · ')}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Published products" value={products.count ?? '—'} note="Visible in the online store" />
          <Stat label="Orders" value={orders.count ?? '—'} note="All order records" />
          <Stat label="Awaiting payment" value={awaiting.count ?? '—'} note="Pending customer payment" />
          <Stat label="Low stock variants" value={variants.error ? '—' : lowStock} note="Two or fewer available units" />
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="border border-ink/10 bg-white">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <div>
                <h3 className="font-display text-xl">Recent orders</h3>
                <p className="mt-1 text-xs text-ink/50">Latest six orders received</p>
              </div>
              <span className="text-xs text-ink/50">{orders.count ?? 0} total</span>
            </div>
            {(recent.data ?? []).length === 0 ? (
              <p className="px-5 py-10 text-sm text-ink/55">No orders have been placed yet.</p>
            ) : (
              <div className="divide-y divide-ink/10">
                {(recent.data ?? []).map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-sm">{order.order_number}</p>
                      <p className="mt-1 text-xs text-ink/55">{order.customer_name} · {new Date(order.created_at).toLocaleDateString('en-NG')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatNaira(order.total_minor)}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-ink/50">{statusLabel(order.status)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="border border-ink/10 bg-white p-5">
              <h3 className="font-display text-xl">Catalogue</h3>
              <div className="mt-4 flex justify-between border-b border-ink/10 py-3 text-sm">
                <span className="text-ink/60">Active categories</span><strong>{categories.count ?? '—'}</strong>
              </div>
              <div className="flex justify-between py-3 text-sm">
                <span className="text-ink/60">Customer records</span><strong>{customers.count ?? '—'}</strong>
              </div>
            </div>
            <div className="border border-ink/10 bg-white p-5">
              <h3 className="font-display text-xl">Next modules</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center justify-between"><Link href="/admin/products" className="underline">Product management</Link><span className="text-[10px] uppercase tracking-wider text-green-700">Available</span></li>
                <li className="flex items-center justify-between"><Link href="/admin/inventory" className="underline">Inventory management</Link><span className="text-[10px] uppercase tracking-wider text-green-700">Available</span></li>
                <li className="flex items-center justify-between"><Link href="/admin/orders" className="underline">Order management</Link><span className="text-[10px] uppercase tracking-wider text-green-700">Available</span></li>
                <li className="flex items-center justify-between"><Link href="/admin/offers" className="underline">Promotions & coupons</Link><span className="text-[10px] uppercase tracking-wider text-green-700">Available</span></li>
                <li className="flex items-center justify-between"><span>Payment verification</span><span className="text-[10px] uppercase tracking-wider text-ink/45">Planned</span></li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
