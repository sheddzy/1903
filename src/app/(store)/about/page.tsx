import { getSetting } from '@/lib/catalog';

export default async function About() {
  const story = await getSetting('brand_story');
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl">About 1903 Originals</h1>
      <p className="mt-6 leading-relaxed text-ink/80">{story ?? 'Our story will be published here soon.'}</p>
    </main>
  );
}
