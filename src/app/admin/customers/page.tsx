import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import CustomersManager from '@/components/admin/CustomersManager';
export const dynamic='force-dynamic';
export default async function CustomersPage(){const staff=await requireStaff();if(!staff)redirect('/admin/login');return <CustomersManager/>;}
