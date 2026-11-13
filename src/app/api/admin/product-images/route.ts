import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'product-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function GET(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const productId = new URL(req.url).searchParams.get('product_id');
  if (!productId) return NextResponse.json({ error: 'Product ID required.' }, { status: 400 });

  const db = adminClient();
  const { data, error } = await db
    .from('product_images')
    .select('id,storage_path,sort_order,color')
    .eq('product_id', productId)
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const images = (data ?? []).map((item) => ({
    ...item,
    url: db.storage.from(BUCKET).getPublicUrl(item.storage_path).data.publicUrl,
  }));

  return NextResponse.json({ images });
}

export async function POST(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const productId = String(form.get('product_id') ?? '');
  const file = form.get('file');
  const color = String(form.get('color') ?? '').trim() || null;

  if (!/^[0-9a-f-]{36}$/i.test(productId) || !(file instanceof File)) {
    return NextResponse.json({ error: 'Select a product and image.' }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json({ error: 'Only JPG, PNG and WebP images are accepted.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 400 });
  }

  const db = adminClient();
  const { data: product, error: productError } = await db
    .from('products')
    .select('id')
    .eq('id', productId)
    .maybeSingle();

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const { data: existingBucket, error: bucketError } = await db.storage.getBucket(BUCKET);
  if (bucketError && !bucketError.message.toLowerCase().includes('not found')) {
    return NextResponse.json({ error: bucketError.message }, { status: 500 });
  }
  if (!existingBucket) {
    const { error: createError } = await db.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: Object.keys(ALLOWED_TYPES),
    });
    if (createError && !createError.message.toLowerCase().includes('already exists')) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
  }

  const storagePath = productId + '/' + crypto.randomUUID() + '.' + extension;
  const { error: uploadError } = await db.storage.from(BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: latest, error: latestError } = await db
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    await db.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: latestError.message }, { status: 500 });
  }

  const sortOrder = (latest?.sort_order ?? -1) + 1;
  const { data: image, error: imageError } = await db
    .from('product_images')
    .insert({
      product_id: productId,
      storage_path: storagePath,
      sort_order: sortOrder,
      color,
    })
    .select('id,storage_path,sort_order,color')
    .single();

  if (imageError) {
    await db.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: imageError.message }, { status: 500 });
  }

  const publicUrl = db.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
  return NextResponse.json({ image, public_url: publicUrl }, { status: 201 });
}

export async function DELETE(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Image ID required.' }, { status: 400 });
  }

  const db = adminClient();
  const { data: image, error: lookupError } = await db
    .from('product_images')
    .select('id,storage_path')
    .eq('id', body.id)
    .maybeSingle();

  if (lookupError || !image) {
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  }

  const { error: removeError } = await db.storage.from(BUCKET).remove([image.storage_path]);
  if (removeError) return NextResponse.json({ error: removeError.message }, { status: 500 });

  const { error: deleteError } = await db.from('product_images').delete().eq('id', body.id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
