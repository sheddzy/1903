import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { rateLimit, clientIp } from '@/lib/ratelimit';

// Order number + email required, so order numbers alone cannot be enumerated.
export async function GET(req: Request) {
  if (!rateLimit(`track:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }
  const url = new URL(req.url);
  const order = url.searchParams.get('order')?.trim() ?? '';
  const email = url.searchParams.get('email')?.trim() ?? '';
  if (!order || !email || order.length > 40 || email.length > 200) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const { data, error } = await adminClient().rpc('get_order_tracking', {
    p_order_number: order,
    p_email: email,
  });
  if (error) return NextResponse.json({ error: 'lookup_failed' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 }); // same reply for wrong email
  return NextResponse.json(data);
}
