import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabase/admin';
import { rateLimit, clientIp } from '@/lib/ratelimit';

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(200) });

export async function POST(req: Request) {
  if (!rateLimit(`news:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_email' }, { status: 400 });

  const { error } = await adminClient()
    .from('newsletter_subscribers')
    .upsert({ email: parsed.data.email, source: 'storefront' }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) {
    console.error('newsletter insert failed', error.message);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
