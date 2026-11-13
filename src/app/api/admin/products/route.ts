import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = adminClient();
  const [products, categories] = await Promise.all([
    db.from('products').select('id,name,slug,description,price_minor,discount_price_minor,status,is_new_arrival,is_best_seller,is_preorder,category_id,created_at,product_categories(name),product_variants(id,size,color,stock_on_hand,reserved_qty,is_active)')
      .order('created_at', { ascending: false }),
    db.from('product_categories').select('id,name').eq('is_active', true).order('sort_order'),
  ]);
  if (products.error || categories.error) {
    return NextResponse.json({ error: products.error?.message ?? categories.error?.message }, { status: 500 });
  }
  return NextResponse.json({ products: products.data ?? [], categories: categories.data ?? [] });
}

export async function POST(request: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
  }
  const price = Number(body.price);
  const discount = body.discount === '' || body.discount == null ? null : Number(body.discount);
  if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(price * 100)) {
    return NextResponse.json({ error: 'Enter a valid price in naira.' }, { status: 400 });
  }
  if (discount !== null && (!Number.isFinite(discount) || discount <= 0 || discount >= price || !Number.isInteger(discount * 100))) {
    return NextResponse.json({ error: 'Sale price must be lower than the regular price.' }, { status: 400 });
  }
  if (!Array.isArray(body.variants) || body.variants.length === 0) {
    return NextResponse.json({ error: 'Add at least one size/colour/stock variant.' }, { status: 400 });
  }
  const variants = body.variants.map((v: { size?: string; color?: string; stock?: number }) => ({
    size: String(v.size ?? '').trim(),
    color: String(v.color ?? '').trim(),
    stock_on_hand: Number(v.stock),
    reserved_qty: 0,
    is_active: true,
  }));
  if (variants.some((v: {size:string;color:string;stock_on_hand:number}) =>
    !v.size || !v.color || !Number.isInteger(v.stock_on_hand) || v.stock_on_hand < 0
  )) return NextResponse.json({ error: 'Each variant needs a size, colour and whole-number stock quantity.' }, { status: 400 });

  const slug = String(body.name).trim().toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const db = adminClient();
  const { data: product, error } = await db.from('products').insert({
    name: String(body.name).trim(),
    slug: slug + '-' + crypto.randomUUID().slice(0, 8),
    description: String(body.description ?? '').trim() || null,
    category_id: body.categoryId || null,
    price_minor: Math.round(price * 100),
    discount_price_minor: discount === null ? null : Math.round(discount * 100),
    status: body.status === 'published' ? 'published' : 'draft',
    is_new_arrival: Boolean(body.isNew),
    is_best_seller: Boolean(body.isBest),
    is_preorder: Boolean(body.isPreorder),
    tags: [],
  }).select('id').single();
  if (error || !product) return NextResponse.json({ error: error?.message ?? 'Could not create product.' }, { status: 500 });

  const { error: variantError } = await db.from('product_variants').insert(
    variants.map((v: {size:string;color:string;stock_on_hand:number;reserved_qty:number;is_active:boolean}) => ({ ...v, product_id: product.id }))
  );
  if (variantError) {
    await db.from('products').delete().eq('id', product.id);
    return NextResponse.json({ error: variantError.message }, { status: 500 });
  }
  return NextResponse.json({ id: product.id, message: 'Product created.' }, { status: 201 });
}
