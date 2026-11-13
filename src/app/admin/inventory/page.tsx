import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import InventoryManager from '@/components/admin/InventoryManager';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const staff = await requireStaff();
  if (!staff) redirect('/admin/login');
  return <InventoryManager />;
}
