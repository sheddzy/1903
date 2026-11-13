import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import PaymentsManager from '@/components/admin/PaymentsManager';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const staff = await requireStaff();
  if (!staff) redirect('/admin/login');
  return <PaymentsManager />;
}
