import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AddressBook from '@/components/AddressBook';

export const dynamic = 'force-dynamic';

export default async function CustomerAddressesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/account/addresses');

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/account" className="text-xs uppercase tracking-widest underline">Back to my account</Link>
      <h1 className="mt-4 font-display text-4xl">Delivery addresses</h1>
      <p className="mt-2 mb-8 text-sm text-ink/60">Save and manage the addresses you use for delivery.</p>
      <AddressBook />
    </main>
  );
}
