-- 1903 ORIGINALS DEMO CATALOGUE
-- Sample products only. Prices are NGN kobo. No orders/payments are created.
-- Products are tagged 'demo'. Safe to re-run.

insert into public.product_categories (name, slug, sort_order, is_active) values
('Dresses','dresses',1,true),('Tops','tops',2,true),('Bottoms','bottoms',3,true),
('Sets','sets',4,true),('Jumpsuits','jumpsuits',5,true),('Accessories','accessories',6,true)
on conflict (slug) do update set name=excluded.name, sort_order=excluded.sort_order, is_active=true;

with d(slug,name,cat,price,discount,is_new,is_best,description,colours,sizes) as (values
('aria-midi-dress','Aria Midi Dress','dresses',5800000,4900000,true,false,'A fluid midi dress with a defined waist and soft, elegant drape. Designed for day-to-evening dressing.',array['Ivory','Black'],array['S','M','L']),
('sable-slip-dress','Sable Slip Dress','dresses',4500000,null,false,true,'A minimal slip silhouette with a clean neckline and fluid finish.',array['Black','Sand'],array['S','M','L']),
('ivory-column-gown','Ivory Column Gown','dresses',8500000,null,true,false,'A floor-length column silhouette with a refined open back.',array['Ivory'],array['S','M','L']),
('linen-cropped-shirt','Linen Cropped Shirt','tops',2800000,null,false,true,'A relaxed cropped shirt in a breathable linen-look finish.',array['Ivory','Sand'],array['S','M','L']),
('silk-cami-top','Silk Cami Top','tops',2400000,null,true,false,'A lightweight cami with delicate adjustable straps and a softly draped neckline.',array['Black','Ivory'],array['S','M','L']),
('structured-bodysuit','Structured Bodysuit','tops',2200000,null,false,false,'A sculpted essential with a square neckline and smooth close fit.',array['Black'],array['S','M','L']),
('wide-leg-trousers','Wide Leg Trousers','bottoms',3500000,null,false,true,'High-waisted tailored trousers with a fluid wide leg.',array['Black','Sand'],array['S','M','L']),
('pleated-midi-skirt','Pleated Midi Skirt','bottoms',3000000,2500000,true,false,'A softly structured midi skirt with fine pleats.',array['Ivory','Black'],array['S','M','L']),
('two-piece-linen-set','Two Piece Linen Set','sets',6200000,null,true,false,'A coordinated top and trouser set with relaxed proportions.',array['Sand','Ivory'],array['S','M','L']),
('knit-co-ord','Knit Co-ord','sets',5500000,null,false,true,'A soft matching knit top and skirt set.',array['Black','Sand'],array['S','M','L']),
('tailored-jumpsuit','Tailored Jumpsuit','jumpsuits',6800000,null,false,false,'A modern tailored jumpsuit with a defined waist.',array['Black','Ivory'],array['S','M','L']),
('leather-belt','Leather Belt','accessories',1500000,null,true,false,'A slim everyday belt with a subtle brushed-metal buckle.',array['Black','Tan'],array['One Size'])
)
insert into public.products
(name,slug,description,category_id,price_minor,discount_price_minor,tags,is_new_arrival,is_best_seller,is_preorder,status)
select d.name,d.slug,d.description,c.id,d.price,d.discount,array['demo'],d.is_new,d.is_best,false,'published'
from d join public.product_categories c on c.slug=d.cat
on conflict (slug) do update set
name=excluded.name, description=excluded.description, category_id=excluded.category_id,
price_minor=excluded.price_minor, discount_price_minor=excluded.discount_price_minor,
tags=array['demo'], is_new_arrival=excluded.is_new_arrival,
is_best_seller=excluded.is_best, is_preorder=false, status='published';

with d(slug,colours,sizes) as (values
('aria-midi-dress',array['Ivory','Black'],array['S','M','L']),
('sable-slip-dress',array['Black','Sand'],array['S','M','L']),
('ivory-column-gown',array['Ivory'],array['S','M','L']),
('linen-cropped-shirt',array['Ivory','Sand'],array['S','M','L']),
('silk-cami-top',array['Black','Ivory'],array['S','M','L']),
('structured-bodysuit',array['Black'],array['S','M','L']),
('wide-leg-trousers',array['Black','Sand'],array['S','M','L']),
('pleated-midi-skirt',array['Ivory','Black'],array['S','M','L']),
('two-piece-linen-set',array['Sand','Ivory'],array['S','M','L']),
('knit-co-ord',array['Black','Sand'],array['S','M','L']),
('tailored-jumpsuit',array['Black','Ivory'],array['S','M','L']),
('leather-belt',array['Black','Tan'],array['One Size'])
)
insert into public.product_variants (product_id,size,color,stock_on_hand,reserved_qty,is_active)
select p.id,s.sz,c.clr,
case when d.slug='sable-slip-dress' and s.sz='M' and c.clr='Black' then 0
when d.slug='linen-cropped-shirt' and s.sz='S' and c.clr='Ivory' then 2
when s.sz='M' then 6 else 4 end,0,true
from d join public.products p on p.slug=d.slug and 'demo'=any(p.tags)
cross join lateral unnest(d.sizes) s(sz)
cross join lateral unnest(d.colours) c(clr)
where not exists (select 1 from public.product_variants v
where v.product_id=p.id and v.size=s.sz and v.color=c.clr);

update public.product_variants v set stock_on_hand=0
from public.products p where v.product_id=p.id and p.slug='sable-slip-dress'
and 'demo'=any(p.tags) and v.size='M' and v.color='Black';
update public.product_variants v set stock_on_hand=2
from public.products p where v.product_id=p.id and p.slug='linen-cropped-shirt'
and 'demo'=any(p.tags) and v.size='S' and v.color='Ivory';

insert into public.store_settings(key,value,is_public) values
('announcement',to_jsonb('1903 ORIGINALS — Explore the first collection.'::text),true),
('promo_banner',to_jsonb('A considered wardrobe. Discover the 1903 collection.'::text),true),
('brand_story',to_jsonb('1903 Originals is built around considered pieces, clean silhouettes and versatile essentials. The collection brings together modern tailoring, effortless separates and understated statement pieces. This is sample copy for the demo store and should be replaced with the approved brand story.'::text),true)
on conflict (key) do update set value=excluded.value,is_public=true;
