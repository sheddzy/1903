import Link from 'next/link';
import { getCategories, getSetting } from '@/lib/catalog';
import CartLink from '@/components/CartLink';

export default async function Header() {
  const [categories, announcement] = await Promise.all([getCategories(), getSetting('announcement')]);

  const links = [
    { href: '/shop?filter=new', label: 'New Arrivals' },
    { href: '/shop', label: 'Shop All' },
    ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
    { href: '/collections', label: 'Collections' },
    { href: '/about', label: 'About 1903' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="border-b border-ink/10 bg-ivory">
      {announcement && (
        <div className="bg-ink px-4 py-2 text-center text-[11px] uppercase tracking-[0.18em] text-ivory">
          {announcement}
        </div>
      )}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <details className="relative lg:hidden">
          <summary className="cursor-pointer list-none text-sm tracking-wide">Menu</summary>
          <nav className="absolute left-0 top-8 z-20 flex w-60 flex-col gap-3 border border-ink/10 bg-ivory p-5 shadow-sm">
            {links.map((l) => (
              <Link key={l.href + l.label} href={l.href} className="text-sm">{l.label}</Link>
            ))}
            <Link href="/track" className="text-sm">Track order</Link>
          </nav>
        </details>
        <Link href="/" className="font-display text-3xl tracking-[0.3em]">1903</Link>
        <div className="flex items-center gap-6">
          <Link href="/track" className="hidden text-sm tracking-wide hover:underline lg:block">Track order</Link>
          <CartLink />
        </div>
      </div>
      <nav className="mx-auto hidden max-w-7xl justify-center gap-8 px-6 pb-4 lg:flex">
        {links.map((l) => (
          <Link key={l.href + l.label} href={l.href} className="text-[13px] uppercase tracking-[0.14em] hover:underline">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
