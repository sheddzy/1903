import { finalizePaystackPayment } from '@/lib/payments';
import ClearCartOnSuccess from '@/components/ClearCartOnSuccess';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ reference?: string; trxref?: string }> };

export default async function CheckoutCallback({ searchParams }: Props) {
  const sp = await searchParams;
  const reference = sp.reference ?? sp.trxref;
  const out = reference ? await finalizePaystackPayment(reference) : null;
  const paid = out?.result === 'confirmed' || out?.result === 'already_processed';

  let title = 'We could not find your payment';
  let body = 'If you were charged, contact us with your payment reference and we will sort it out.';

  if (paid) {
    title = 'Thank you. Your order is confirmed.';
    body = `Your order number is ${out?.orderNumber}. A confirmation email will follow.`;
  } else if (out?.result === 'needs_review' || out?.result === 'amount_mismatch') {
    title = 'We received your payment and are reviewing it';
    body = `Order ${out.orderNumber ?? ''}: our team will confirm it shortly. You do not need to pay again.`;
  } else if (out?.result === 'not_successful') {
    title = 'Your payment was not completed';
    body = `Order ${out.orderNumber ?? ''} is still reserved for a short time. You can try paying again.`;
  } else if (out?.result === 'error') {
    title = 'We are confirming your payment';
    body = 'This is taking longer than usual. Refresh this page in a minute. You do not need to pay again.';
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      {paid && <ClearCartOnSuccess />}
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="mt-4 text-neutral-700">{body}</p>
    </main>
  );
}
