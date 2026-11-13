import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '@/lib/env';

const BASE = 'https://api.paystack.co';

type PaystackTx = {
  status: string;
  reference: string;
  amount: number; // kobo
  currency: string;
  [k: string]: unknown;
};

export async function initializeTransaction(p: {
  email: string;
  amountMinor: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorization_url: string; reference: string }> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env('PAYSTACK_SECRET_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: p.email,
      amount: p.amountMinor,
      currency: 'NGN',
      reference: p.reference,
      callback_url: p.callbackUrl,
      metadata: p.metadata ?? {},
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status || !json?.data?.authorization_url) {
    throw new Error(`Paystack initialize failed (${res.status})`);
  }
  return json.data;
}

// Source of truth for payment success: ask Paystack, never trust the browser.
export async function verifyTransaction(reference: string): Promise<PaystackTx> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env('PAYSTACK_SECRET_KEY')}` },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data) throw new Error(`Paystack verify failed (${res.status})`);
  return json.data as PaystackTx;
}

// Paystack signs the RAW request body with HMAC-SHA512 using your secret key.
export function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac('sha512', env('PAYSTACK_SECRET_KEY')).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
