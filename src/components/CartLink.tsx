'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

export default function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="text-sm tracking-wide hover:underline">
      Cart{ready && count > 0 ? ` (${count})` : ''}
    </Link>
  );
}
