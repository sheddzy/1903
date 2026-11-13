import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import OffersManager from '@/components/admin/OffersManager';

export const dynamic = 'force-dynamic';

export default async function AdminOffersPage() {
  const staff = await requireStaff();
  if (!staff) redirect('/admin/login');
  return <OffersManager />;
}
