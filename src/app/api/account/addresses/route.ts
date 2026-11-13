import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const addressSchema = z.object({
  label: z.string().trim().min(1).max(40),
  recipient_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(20),
  address_line1: z.string().trim().min(1).max(250),
  address_line2: z.string().trim().max(250).optional().nullable(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postal_code: z.string().trim().max(20).optional().nullable(),
  is_default: z.boolean().default(false),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('customer_addresses')
    .select('id,label,recipient_name,phone,address_line1,address_line2,city,state,postal_code,is_default,created_at')
    .eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load addresses' }, { status: 500 });
  return NextResponse.json({ addresses: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = addressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid address details', details: parsed.error.flatten() }, { status: 400 });

  const values = parsed.data;
  if (values.is_default) {
    const { error: clearError } = await supabase.from('customer_addresses').update({ is_default: false }).eq('user_id', user.id);
    if (clearError) return NextResponse.json({ error: 'Could not update default address' }, { status: 500 });
  }
  const { data, error } = await supabase.from('customer_addresses').insert({
    ...values, user_id: user.id,
    address_line2: values.address_line2 || null,
    postal_code: values.postal_code || null,
  }).select('id,label,recipient_name,phone,address_line1,address_line2,city,state,postal_code,is_default,created_at').single();
  if (error) return NextResponse.json({ error: 'Could not save address' }, { status: 500 });
  return NextResponse.json({ address: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  const parsed = addressSchema.safeParse(body?.address);
  if (!id || !parsed.success) return NextResponse.json({ error: 'Invalid address details' }, { status: 400 });
  if (parsed.data.is_default) {
    const { error: clearError } = await supabase.from('customer_addresses').update({ is_default: false }).eq('user_id', user.id);
    if (clearError) return NextResponse.json({ error: 'Could not update default address' }, { status: 500 });
  }
  const { data, error } = await supabase.from('customer_addresses').update({
    ...parsed.data, address_line2: parsed.data.address_line2 || null, postal_code: parsed.data.postal_code || null,
  }).eq('id', id).eq('user_id', user.id)
    .select('id,label,recipient_name,phone,address_line1,address_line2,city,state,postal_code,is_default,created_at').single();
  if (error) return NextResponse.json({ error: 'Could not update address' }, { status: 500 });
  return NextResponse.json({ address: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  const { error } = await supabase.from('customer_addresses').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: 'Could not delete address' }, { status: 500 });
  return NextResponse.json({ success: true });
}
