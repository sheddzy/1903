import { NextResponse } from 'next/server';
import { verifySignature } from '@/lib/paystack';
import { finalizePaystackPayment } from '@/lib/payments';

export async function POST(req: Request) {
  // Must read the RAW body: the signature is computed over the exact bytes sent.
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get('x-paystack-signature'))) {
    return new NextResponse('invalid signature', { status: 401 });
  }

  let event: { event?: string; data?: { reference?: unknown } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse('bad json', { status: 400 });
  }

  if (event.event !== 'charge.success') return NextResponse.json({ received: true });
  const reference = event.data?.reference;
  if (typeof reference !== 'string') return new NextResponse('bad payload', { status: 400 });

  // The webhook is only a trigger. finalizePaystackPayment re-verifies with Paystack's API.
  const out = await finalizePaystackPayment(reference);
  console.log('paystack webhook', reference, out.result);

  // 5xx makes Paystack retry (transient problems). Everything else is final.
  if (out.result === 'error') return new NextResponse('retry', { status: 500 });
  return NextResponse.json({ received: true, result: out.result });
}
