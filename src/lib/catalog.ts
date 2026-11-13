import { createClient } from '@/lib/supabase/server';
import type { Category, Product } from '@/lib/catalog-utils';

export * from '@/lib/catalog-utils';

const FIELDS = `id,name,slug,description,price_minor,discount_price_minor,is_new_arrival,is_best_seller,
  is_preorder,tags,images:product_images(storage_path,sort_order,color),
  variants:product_variants(id,size,color,stock_on_hand,reserved_qty,is_active)`;

function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Staff users also pass RLS for drafts, so published/active is enforced explicitly here.
export async function listProducts(opts: {
  categorySlug?: string;
  filter?: 'new' | 'best';
  limit?: number;
  excludeId?: string;
} = {}): Promise<Product[]> {
  if (!hasSupabaseConfig()) {
    console.error('Supabase is not configured: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return [];
  }
  if (!hasSupabaseConfig()) {
    console.error('Supabase is not configured: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }
  if (!hasSupabaseConfig()) {
    console.error('Supabase is not configured: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return [];
  }
  if (!hasSupabaseConfig()) {
    console.error('Supabase is not configured: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }
  const supabase = await createClient(); // outside try: Next uses a thrown signal here to mark pages dynamic
  try {
    const select = opts.categorySlug
      ? `${FIELDS},category:product_categories!inner(name,slug)`
      : `${FIELDS},category:product_categories(name,slug)`;
    let q = supabase.from('products').select(select).eq('status', 'published');
    if (opts.categorySlug) q = q.eq('category.slug', opts.categorySlug);
    if (opts.filter === 'new') q = q.eq('is_new_arrival', true);
    if (opts.filter === 'best') q = q.eq('is_best_seller', true);
    if (opts.excludeId) q = q.neq('id', opts.excludeId);
    q = q.order('created_at', { ascending: false });
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as unknown as Product[];
  } catch (e) {
    console.error('listProducts failed', (e as Error).message);
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient(); // outside try: Next uses a thrown signal here to mark pages dynamic
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`${FIELDS},category:product_categories(name,slug)`)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as Product) ?? null;
  } catch (e) {
    console.error('getProduct failed', (e as Error).message);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient(); // outside try: Next uses a thrown signal here to mark pages dynamic
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('id,name,slug')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return (data ?? []) as Category[];
  } catch (e) {
    console.error('getCategories failed', (e as Error).message);
    return [];
  }
}

export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient(); // outside try: Next uses a thrown signal here to mark pages dynamic
  try {
    const { data } = await supabase
      .from('store_settings').select('value').eq('key', key).eq('is_public', true).maybeSingle();
    return typeof data?.value === 'string' ? data.value : null;
  } catch {
    return null;
  }
}
