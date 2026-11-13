import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Gate for /admin and /api/admin. Route handlers re-check with requireStaff().
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path === '/admin/login') return NextResponse.next();

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  let allowed = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single();

    if (profile?.role_id) {
      const { data: role } = await supabase
        .from('roles')
        .select('name')
        .eq('id', profile.role_id)
        .single();
      allowed = role?.name === 'staff' || role?.name === 'admin';
    }
  }

  if (!allowed) {
    return path.startsWith('/api/')
      ? NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return res;
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
