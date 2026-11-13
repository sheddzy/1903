import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await adminClient().from('promotions').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promotions: data ?? [] });
}

export async function POST(request: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await request.json().catch(() => null);
  if (!b || typeof b.title !== 'string' || !b.title.trim()) return NextResponse.json({ error: 'Promotion title is required.' }, { status: 400 });
  const row = {
    title: b.title.trim(), description: String(b.description ?? '').trim() || null,
    banner_text: String(b.banner_text ?? '').trim() || null,
    starts_at: b.starts_at || null, ends_at: b.ends_at || null, is_active: Boolean(b.is_active),
  };
  if (row.starts_at && row.ends_at && new Date(row.ends_at) <= new Date(row.starts_at)) return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
  const { data, error } = await adminClient().from('promotions').insert(row).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promotion: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await request.json().catch(() => null);
  if (!b || typeof b.id !== 'string' || typeof b.is_active !== 'boolean') return NextResponse.json({ error: 'Promotion ID and active status are required.' }, { status: 400 });
  const { error } = await adminClient().from('promotions').update({ is_active: b.is_active, updated_at: new Date().toISOString() }).eq('id', b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
