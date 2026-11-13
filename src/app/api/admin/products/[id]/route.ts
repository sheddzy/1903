import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || !['draft', 'published'].includes(body.status)) {
    return NextResponse.json({ error: 'A valid product status is required.' }, { status: 400 });
  }
  const { error } = await adminClient().from('products').update({ status: body.status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Product status updated.' });
}
