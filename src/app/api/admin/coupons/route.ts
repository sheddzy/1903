import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await adminClient().from('coupons').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(request: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await request.json().catch(() => null);
  if (!b || typeof b.code !== 'string' || !b.code.trim()) return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
  const type = b.discount_type === 'percentage' ? 'percentage' : b.discount_type === 'fixed' ? 'fixed' : null;
  const value = Number(b.discount_value);
  const min = Number(b.minimum_order_minor ?? 0);
  const limit = b.usage_limit === '' || b.usage_limit == null ? null : Number(b.usage_limit);
  const cap = b.maximum_discount_minor === '' || b.maximum_discount_minor == null ? null : Number(b.maximum_discount_minor);
  if (!type || !Number.isInteger(value) || value <= 0 || (type === 'percentage' && value > 100)) return NextResponse.json({ error: 'Enter a valid discount. Percentage must be 1–100.' }, { status: 400 });
  if (!Number.isInteger(min) || min < 0 || (limit !== null && (!Number.isInteger(limit) || limit < 1)) || (cap !== null && (!Number.isInteger(cap) || cap < 1))) return NextResponse.json({ error: 'Check minimum order, usage limit and discount cap.' }, { status: 400 });
  const row = {
    code: b.code.trim().toUpperCase(), description: String(b.description ?? '').trim() || null,
    discount_type: type, discount_value: value, minimum_order_minor: min,
    usage_limit: limit, maximum_discount_minor: cap,
    starts_at: b.starts_at || null, ends_at: b.ends_at || null, is_active: Boolean(b.is_active),
  };
  if (row.starts_at && row.ends_at && new Date(row.ends_at) <= new Date(row.starts_at)) return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
  const { data, error } = await adminClient().from('coupons').insert(row).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupon: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await request.json().catch(() => null);
  if (!b || typeof b.id !== 'string' || typeof b.is_active !== 'boolean') return NextResponse.json({ error: 'Coupon ID and active status are required.' }, { status: 400 });
  const { error } = await adminClient().from('coupons').update({ is_active: b.is_active, updated_at: new Date().toISOString() }).eq('id', b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
