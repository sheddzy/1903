import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import OrderManager from '@/components/admin/OrderManager';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const staff = await requireStaff();
  if (!staff) redirect('/admin/login');
  return <OrderManager />;
}
