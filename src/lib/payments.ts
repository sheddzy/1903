import 'server-only';
import { adminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/paystack';

export type Finalized = {
  result:
    | 'confirmed'
    | 'already_processed'
    | 'needs_review'
    | 'amount_mismatch'
    | 'not_successful'
    | 'unknown_reference'
    | 'error';
  orderNumber?: string;
};

// Shared by the webhook and the browser callback page. Safe to call any number of times:
// confirm_payment in the database is idempotent.
export async function finalizePaystackPayment(reference: string): Promise<Finalized> {
  const admin = adminClient();

  const { data: pay, error } = await admin
    .from('payments')
    .select('id, order_id, status, orders(order_number)')
    .eq('provider', 'paystack')
    .eq('reference', reference)
    .maybeSingle();
  if (error) return { result: 'error' };
  if (!pay) return { result: 'unknown_reference' };

  const orders = pay.orders as unknown as { order_number: string } | { order_number: string }[] | null;
  const orderNumber = Array.isArray(orders) ? orders[0]?.order_number : orders?.order_number;

  if (pay.status === 'successful') return { result: 'already_processed', orderNumber };

  let tx;
  try {
    tx = await verifyTransaction(reference);
  } catch {
    return { result: 'error', orderNumber };
  }
  if (tx.status !== 'success' || tx.currency !== 'NGN' || tx.reference !== reference) {
    return { result: 'not_successful', orderNumber };
  }

  const { data, error: rpcError } = await admin.rpc('confirm_payment', {
    p_order_id: pay.order_id,
    p_provider: 'paystack',
    p_reference: reference,
    p_amount_minor: tx.amount,
    p_payload: tx,
    p_verified_by: null,
  });
  if (rpcError) {
    console.error('confirm_payment failed', rpcError.message);
    return { result: 'error', orderNumber };
  }
  return { result: data as Finalized['result'], orderNumber };
}
