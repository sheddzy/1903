import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!['draft', 'published'].includes(body.status)) return NextResponse.json({ error: 'A valid product status is required.' }, { status: 400 });
    update.status = body.status;
  }
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    update.name = body.name.trim();
  }
  if (body.description !== undefined) update.description = String(body.description ?? '').trim() || null;
  if (body.categoryId !== undefined) update.category_id = body.categoryId || null;
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(price * 100)) return NextResponse.json({ error: 'Enter a valid price in naira.' }, { status: 400 });
    update.price_minor = Math.round(price * 100);
  }
  if (body.discount !== undefined) {
    const discount = body.discount === '' || body.discount == null ? null : Number(body.discount);
    const regular = Number(body.price);
    if (discount !== null && (!Number.isFinite(discount) || discount <= 0 || discount >= regular || !Number.isInteger(discount * 100))) return NextResponse.json({ error: 'Sale price must be lower than the regular price.' }, { status: 400 });
    update.discount_price_minor = discount === null ? null : Math.round(discount * 100);
  }
  if (body.isNew !== undefined) update.is_new_arrival = Boolean(body.isNew);
  if (body.isBest !== undefined) update.is_best_seller = Boolean(body.isBest);
  if (body.isPreorder !== undefined) update.is_preorder = Boolean(body.isPreorder);
  if (!Object.keys(update).length) return NextResponse.json({ error: 'No changes supplied.' }, { status: 400 });
  const { error } = await adminClient().from('products').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Product updated.' });
}
