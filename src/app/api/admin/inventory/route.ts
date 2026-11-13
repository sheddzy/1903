import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await adminClient()
    .from('product_variants')
    .select('id,product_id,size,color,stock_on_hand,reserved_qty,is_active,products(name,slug)');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ variants: data ?? [] });
}

export async function PATCH(request: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const stock = Number(body?.stock_on_hand);
  if (!body?.id || !Number.isInteger(stock) || stock < 0) {
    return NextResponse.json({ error: 'A variant ID and non-negative whole-number stock quantity are required.' }, { status: 400 });
  }
  const db = adminClient();
  const { data: current, error: readError } = await db.from('product_variants')
    .select('id,reserved_qty').eq('id', body.id).maybeSingle();
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });
  if (!current) return NextResponse.json({ error: 'Variant not found.' }, { status: 404 });
  if (stock < current.reserved_qty) {
    return NextResponse.json({ error: 'Stock cannot be lower than the quantity already reserved.' }, { status: 409 });
  }
  const { error } = await db.from('product_variants').update({ stock_on_hand: stock }).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Stock quantity updated.' });
}
