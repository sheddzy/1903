'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Variant = { id: string; size: string; color: string; stock_on_hand: number; reserved_qty: number; is_active: boolean };
type Product = {
  id: string; name: string; slug: string; description: string | null; price_minor: number;
  discount_price_minor: number | null; status: string; is_new_arrival: boolean; is_best_seller: boolean;
  is_preorder: boolean; category_id: string | null; product_categories: { name: string } | null;
  product_variants: Variant[];
};
type Category = { id: string; name: string };
type VariantDraft = { size: string; color: string; stock: string };

const money = (minor: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(minor / 100);

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('draft');
  const [isNew, setIsNew] = useState(false);
  const [isBest, setIsBest] = useState(false);
  const [isPreorder, setIsPreorder] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>([{ size: 'M', color: 'Black', stock: '5' }]);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const response = await fetch('/api/admin/products', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? 'Could not load products.');
    else { setProducts(data.products); setCategories(data.categories); setError(''); }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function updateVariant(index: number, field: keyof VariantDraft, value: string) {
    setVariants((old) => old.map((v, i) => i === index ? { ...v, [field]: value } : v));
  }
  async function createProduct(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    const response = await fetch(editingId ? '/api/admin/products/' + editingId : '/api/admin/products', {
      method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, description, price, discount, categoryId, status, isNew, isBest, isPreorder,
        ...(!editingId ? { variants: variants.map(v => ({ ...v, stock: Number(v.stock) })) } : {}),
      }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? 'Product creation failed.');
    else {
      setMessage(editingId ? 'Product updated successfully.' : 'Product created successfully.');
      setEditingId(null); setName(''); setDescription(''); setPrice(''); setDiscount('');
      setStatus('draft'); setIsNew(false); setIsBest(false); setIsPreorder(false);
      setVariants([{ size: 'M', color: 'Black', stock: '5' }]);
      await load();
    }
    setBusy(false);
  }

  async function changeStatus(product: Product) {
    const next = product.status === 'published' ? 'draft' : 'published';
    const response = await fetch('/api/admin/products/' + product.id, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? 'Could not update product.');
    else { setMessage(next === 'published' ? 'Product published.' : 'Product moved to draft.'); await load(); }
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div><p className="text-[10px] uppercase tracking-[0.25em] text-ink/50">1903 Originals</p><h1 className="mt-1 font-display text-3xl">Products</h1></div>
          <div className="flex gap-3"><Link href="/admin" className="border border-ink/20 px-4 py-2 text-xs uppercase tracking-wider">Dashboard</Link><Link href="/shop" className="border border-ink/20 px-4 py-2 text-xs uppercase tracking-wider">View store</Link></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="h-fit border border-ink/10 bg-white p-5">
          <h2 className="font-display text-2xl">{editingId ? "Edit product" : "Add product"}</h2>
          <p className="mt-1 text-xs text-ink/55">Prices are entered in naira. Stock is managed per size and colour.</p>
          <form onSubmit={createProduct} className="mt-6 space-y-4">
            <label className="block text-xs">Product name<input required value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm" /></label>
            <label className="block text-xs">Description<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs">Price (₦)<input required type="number" min="1" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm" /></label>
              <label className="block text-xs">Sale price (₦)<input type="number" min="0.01" step="0.01" value={discount} onChange={e=>setDiscount(e.target.value)} className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm" /></label>
            </div>
            <label className="block text-xs">Category<select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="mt-1 w-full border border-ink/20 bg-white px-3 py-2 text-sm"><option value="">No category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="block text-xs">Visibility<select value={status} onChange={e=>setStatus(e.target.value)} className="mt-1 w-full border border-ink/20 bg-white px-3 py-2 text-sm"><option value="draft">Save as draft</option><option value="published">Publish immediately</option></select></label>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <label className="flex items-center gap-2"><input type="checkbox" checked={isNew} onChange={e=>setIsNew(e.target.checked)} />New arrival</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={isBest} onChange={e=>setIsBest(e.target.checked)} />Best seller</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={isPreorder} onChange={e=>setIsPreorder(e.target.checked)} />Pre-order</label>
            </div>
            {!editingId && <div className="border-t border-ink/10 pt-4">
              <div className="flex items-center justify-between"><h3 className="text-sm">Variants and opening stock</h3><button type="button" onClick={()=>setVariants(v=>[...v,{size:'',color:'',stock:'0'}])} className="text-xs underline">Add variant</button></div>
              <p className="mt-1 text-xs text-ink/50">One row per size and colour combination.</p>
              <div className="mt-3 space-y-2">
                {variants.map((v,i)=><div key={i} className="grid grid-cols-[1fr_1fr_0.7fr_auto] gap-2">
                  <input aria-label="Size" placeholder="Size" value={v.size} onChange={e=>updateVariant(i,'size',e.target.value)} className="min-w-0 border border-ink/20 px-2 py-2 text-xs" />
                  <input aria-label="Colour" placeholder="Colour" value={v.color} onChange={e=>updateVariant(i,'color',e.target.value)} className="min-w-0 border border-ink/20 px-2 py-2 text-xs" />
                  <input aria-label="Stock" type="number" min="0" step="1" placeholder="Qty" value={v.stock} onChange={e=>updateVariant(i,'stock',e.target.value)} className="min-w-0 border border-ink/20 px-2 py-2 text-xs" />
                  <button type="button" aria-label="Remove variant" disabled={variants.length===1} onClick={()=>setVariants(vs=>vs.filter((_,j)=>j!==i))} className="px-2 text-sm text-red-700 disabled:opacity-30">×</button>
                </div>)}
              </div>
            </div>
            {editingId && <button type="button" onClick={()=>{setEditingId(null);setName("");setDescription("");setPrice("");setDiscount("");}} className="text-xs underline">Cancel editing</button>}
            {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
            {message && <p role="status" className="text-xs text-green-700">{message}</p>}
            <button disabled={busy} className="w-full bg-ink px-4 py-3 text-xs uppercase tracking-wider text-white disabled:opacity-50">{busy ? 'Saving…' : editingId ? 'Save changes' : 'Create product'}</button>
          </form>
        </section>
        <section>
          <div className="mb-4 flex items-end justify-between"><div><h2 className="font-display text-2xl">Catalogue</h2><p className="mt-1 text-xs text-ink/55">{products.length} products in database</p></div><button onClick={()=>void load()} className="text-xs underline">Refresh</button></div>
          {loading ? <p className="py-10 text-sm">Loading catalogue…</p> : products.length===0 ? <p className="border border-ink/10 bg-white p-6 text-sm">No products found.</p> : (
            <div className="space-y-3">{products.map(p=><article key={p.id} className="border border-ink/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="text-sm font-medium">{p.name}</h3><p className="mt-1 text-xs text-ink/55">{p.product_categories?.name ?? 'Uncategorised'} · {p.product_variants.length} variants</p><p className="mt-2 text-sm">{money(p.discount_price_minor ?? p.price_minor)}{p.discount_price_minor ? <span className="ml-2 text-xs text-ink/45 line-through">{money(p.price_minor)}</span> : null}</p></div>
                <div className="text-right"><span className={'text-[10px] uppercase tracking-wider '+(p.status==='published'?'text-green-700':'text-ink/50')}>{p.status}</span><p className="mt-1 text-xs text-ink/50">{p.product_variants.reduce((n,v)=>n+Math.max(0,v.stock_on_hand-v.reserved_qty),0)} available</p></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-ink/55">{p.is_new_arrival&&<span>New arrival</span>}{p.is_best_seller&&<span>Best seller</span>}{p.is_preorder&&<span>Pre-order</span>}</div>
              <div className="mt-3 flex justify-end gap-2"><button onClick={()=>{setEditingId(p.id);setName(p.name);setDescription(p.description ?? "");setPrice(String(p.price_minor/100));setDiscount(p.discount_price_minor == null ? "" : String(p.discount_price_minor/100));setCategoryId(p.category_id ?? "");setStatus(p.status);setIsNew(p.is_new_arrival);setIsBest(p.is_best_seller);setIsPreorder(p.is_preorder);setError("");setMessage("");window.scrollTo({top:0,behavior:"smooth"});}} className="border border-ink/20 px-3 py-2 text-[10px] uppercase tracking-wider">Edit details</button><button onClick={()=>void changeStatus(p)} className="border border-ink/20 px-3 py-2 text-[10px] uppercase tracking-wider">{p.status==='published'?'Move to draft':'Publish product'}</button></div>
            </article>)}</div>
          )}
        </section>
      </div>
    </main>
  );
}
