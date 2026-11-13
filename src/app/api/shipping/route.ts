import { NextResponse } from 'next/server';
import { shippingFeeMinor } from '@/lib/shipping';

// Lets the checkout page show the same fee the server will charge.
export async function GET(req: Request) {
  const state = new URL(req.url).searchParams.get('state')?.trim() ?? '';
  if (!state || state.length > 100) return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  try {
    return NextResponse.json({ fee_minor: shippingFeeMinor(state) });
  } catch {
    return NextResponse.json({ error: 'shipping_not_configured' }, { status: 500 });
  }
}
