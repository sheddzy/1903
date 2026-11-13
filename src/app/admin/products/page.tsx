import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import ProductManager from '@/components/admin/ProductManager';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const staff = await requireStaff();
  if (!staff) redirect('/admin/login');
  return <ProductManager />;
}
