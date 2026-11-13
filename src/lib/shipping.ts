import { num } from '@/lib/env';

// Placeholder rule: two flat rates driven by env vars. Replace once the shipping
// decision is made (zones, courier quotes, free-shipping threshold).
export function shippingFeeMinor(state: string): number {
  return state.trim().toLowerCase() === 'lagos'
    ? num('SHIPPING_FEE_LAGOS_MINOR')
    : num('SHIPPING_FEE_OTHER_MINOR');
}
