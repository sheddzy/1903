import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Temporary landing page. Dashboard modules (products, inventory, orders, deliveries) come next.
export default async function AdminHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl">1903 Admin</h1>
      <p className="mt-3 text-neutral-700">Signed in as {user?.email}. Dashboard modules are built in the next step.</p>
    </main>
  );
}
