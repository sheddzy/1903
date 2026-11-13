import 'server-only';
import { createClient } from '@/lib/supabase/server';

// Always re-check staff status inside admin route handlers. Do not rely on middleware alone.
export async function requireStaff(): Promise<{ userId: string; role: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'staff' && profile?.role !== 'admin') return null;
  return { userId: user.id, role: profile.role };
}
