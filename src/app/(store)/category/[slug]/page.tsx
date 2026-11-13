import { notFound } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import { getCategories, listProducts } from '@/lib/catalog';

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const products = await listProducts({ categorySlug: slug });

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-10 font-display text-4xl">{category.name}</h1>
      <ProductGrid products={products} empty={`No ${category.name.toLowerCase()} published yet.`} />
    </main>
  );
}
