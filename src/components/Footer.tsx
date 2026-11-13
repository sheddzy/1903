import Link from 'next/link';
import { getCategories } from '@/lib/catalog';

export default async function Footer() {
  const categories = await getCategories();
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '');
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  return (
    <footer className="mt-24 border-t border-ink/10 bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-3xl tracking-[0.3em]">1903</p>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.2em]">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop?filter=new">New Arrivals</Link></li>
            <li><Link href="/shop">Shop All</Link></li>
            {categories.map((c) => <li key={c.id}><Link href={`/category/${c.slug}`}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.2em]">Help</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/policies/faq">FAQ</Link></li>
            <li><Link href="/policies/shipping">Shipping and delivery</Link></li>
            <li><Link href="/policies/returns">Returns and exchanges</Link></li>
            <li><Link href="/policies/privacy">Privacy policy</Link></li>
            <li><Link href="/policies/terms">Terms and conditions</Link></li>
            <li><Link href="/track">Track your order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.2em]">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact">Contact us</Link></li>
            {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
            {instagram && <li><a href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10 py-5 text-center text-xs text-ink/60">
        &copy; {new Date().getFullYear()} 1903. All rights reserved.
      </div>
      {whatsapp && (
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-30 bg-ink px-4 py-3 text-xs uppercase tracking-widest text-ivory shadow">
          WhatsApp
        </a>
      )}
    </footer>
  );
}
