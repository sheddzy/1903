import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Service-role client: bypasses RLS. Server-side only, and only after the caller
// has been validated (checkout input, verified webhook, or an authenticated staff user).
export function adminClient() {
  return createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
