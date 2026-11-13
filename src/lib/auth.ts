import 'server-only';
import { createClient as createUserClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';

// Verify identity with the user's session, then check the role server-side.
// The service-role client avoids RLS blocking the profile/role lookup.
export async function requireStaff(): Promise<{ userId: string; role: string } | null> {
  const userClient = await createUserClient();
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return null;

  const db = adminClient();
  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('role_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile?.role_id) return null;

  const { data: role, error: roleError } = await db
    .from('roles')
    .select('name')
    .eq('id', profile.role_id)
    .maybeSingle();

  if (roleError || (role?.name !== 'staff' && role?.name !== 'admin')) return null;
  return { userId: user.id, role: role.name };
}
