import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { adminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { env, num } from '@/lib/env';
import { shippingFeeMinor } from '@/lib/shipping';
import { initializeTransaction } from '@/lib/paystack';
import { rateLimit, clientIp } from '@/lib/ratelimit';

const text = (max: number) => z.string().trim().min(1).max(max);

const schema = z.object({
  items: z
    .array(z.object({ variant_id: z.string().uuid(), quantity: z.number().int().min(1).max(10) }))
    .min(1)
    .max(30),
  customer: z.object({
    email: z.string().trim().email().max(200),
    full_name: text(120),
    phone: z.string().trim().min(7).max(20),
  }),
  shipping: z.object({
    name: text(120),
    phone: z.string().trim().min(7).max(20),
    address: text(300),
    city: text(100),
    state: text(100),
  }),
  method: z.enum(['paystack', 'bank_transfer']),
  // Generated once per checkout attempt in the browser (e.g. crypto.randomUUID()).
  idempotency_key: z.string().min(16).max(80),
});

const KNOWN_ERRORS = /^(insufficient_stock|unavailable|unknown_variant|empty_cart|invalid_quantity)(?::(.*))?$/;

export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }
  const b = parsed.data;

  // Verified user id if signed in; guests proceed with null.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = adminClient();

  // Prices and stock are decided inside the database. The client never sends a price.
  let orderId: string | null = null;
  const { data, error } = await admin.rpc('create_order', {
    p_items: b.items,
    p_customer: { ...b.customer, email: b.customer.email.toLowerCase() },
    p_shipping: b.shipping,
    p_shipping_fee_minor: shippingFeeMinor(b.shipping.state),
    p_idempotency_key: b.idempotency_key,
    p_user_id: user?.id ?? null,
    p_hold_minutes: b.method === 'paystack' ? num('CARD_HOLD_MINUTES') : num('BANK_HOLD_MINUTES'),
  });

  if (error) {
    if (error.code === '23505') {
      // Concurrent double submit with the same key: reuse the order that won.
      const { data: existing } = await admin
        .from('orders').select('id').eq('idempotency_key', b.idempotency_key).maybeSingle();
      orderId = existing?.id ?? null;
    } else {
      const m = KNOWN_ERRORS.exec(error.message);
      if (m) return NextResponse.json({ error: m[1], detail: m[2] ?? null }, { status: 409 });
      console.error('create_order failed', error.message);
      return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
    }
  } else {
    orderId = data as string;
  }
  if (!orderId) return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });

  const { data: order } = await admin
    .from('orders')
    .select('id, order_number, email, total_minor, status')
    .eq('id', orderId)
    .single();
  if (!order) return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  if (order.status !== 'pending_payment') {
    return NextResponse.json({ error: 'order_not_payable', order_number: order.order_number }, { status: 409 });
  }

  if (b.method === 'bank_transfer') {
    await admin.from('payments').upsert(
      {
        order_id: order.id,
        provider: 'bank_transfer',
        reference: order.order_number,
        status: 'awaiting_verification',
        amount_minor: order.total_minor,
      },
      { onConflict: 'provider,reference', ignoreDuplicates: true }
    );
    return NextResponse.json({
      order_number: order.order_number,
      total_minor: order.total_minor,
      bank: {
        bank_name: env('BANK_NAME'),
        account_name: env('BANK_ACCOUNT_NAME'),
        account_number: env('BANK_ACCOUNT_NUMBER'),
        narration: order.order_number,
      },
    });
  }

  // Paystack: a fresh reference per attempt, so a customer can retry payment on the same order.
  const reference = `${order.order_number}-${randomBytes(4).toString('hex')}`;
  const { error: insErr } = await admin.from('payments').insert({
    order_id: order.id,
    provider: 'paystack',
    reference,
    status: 'pending',
    amount_minor: order.total_minor,
  });
  if (insErr) {
    console.error('payment insert failed', insErr.message);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  }

  try {
    const init = await initializeTransaction({
      email: order.email,
      amountMinor: order.total_minor,
      reference,
      callbackUrl: `${env('NEXT_PUBLIC_SITE_URL')}/checkout/callback`,
      metadata: { order_number: order.order_number },
    });
    return NextResponse.json({ order_number: order.order_number, authorization_url: init.authorization_url });
  } catch (e) {
    console.error('paystack init failed', (e as Error).message);
    await admin.from('payments').update({ status: 'failed' }).eq('provider', 'paystack').eq('reference', reference);
    // The stock reservation simply expires if the customer does not retry.
    return NextResponse.json({ error: 'payment_provider_unavailable' }, { status: 502 });
  }
}
