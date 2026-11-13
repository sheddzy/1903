import { notFound } from 'next/navigation';
import { getSetting } from '@/lib/catalog';

const TITLES: Record<string, string> = {
  faq: 'FAQ',
  shipping: 'Shipping and delivery',
  returns: 'Returns and exchanges',
  privacy: 'Privacy policy',
  terms: 'Terms and conditions',
};

type Props = { params: Promise<{ slug: string }> };

// Policy text lives in store_settings (keys policy_faq, policy_shipping, ...). Nothing is invented here.
export default async function Policy({ params }: Props) {
  const { slug } = await params;
  const title = TITLES[slug];
  if (!title) notFound();
  const text = await getSetting(`policy_${slug}`);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl">{title}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-ink/80">
        {text
          ? text.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)
          : <p className="text-ink/60">This page has not been published yet.</p>}
      </div>
    </main>
  );
}
