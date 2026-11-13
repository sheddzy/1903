import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';

const schema = z.object({
  order_id: z.string().uuid(),
  // Amount staff actually saw in the bank account, in kobo. Must equal the order total.
  amount_minor: z.number().int().positive(),
  bank_reference: z.string().trim().max(120).optional(),
});

// Manual verification of a bank transfer.
export async function POST(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  const { order_id, amount_minor, bank_reference } = parsed.data;

  const admin = adminClient();
  const { data: order } = await admin.from('orders').select('order_number').eq('id', order_id).maybeSingle();
  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });

  const { data, error } = await admin.rpc('confirm_payment', {
    p_order_id: order_id,
    p_provider: 'bank_transfer',
    p_reference: order.order_number,
    p_amount_minor: amount_minor,
    p_payload: { bank_reference: bank_reference ?? null },
    p_verified_by: staff.userId,
  });
  if (error) {
    console.error('bank confirm failed', error.message);
    return NextResponse.json({ error: 'confirm_failed' }, { status: 500 });
  }
  return NextResponse.json({ result: data });
}
