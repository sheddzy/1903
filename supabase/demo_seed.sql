-- =====================================================================
-- DEMO DATA ONLY. Every demo product has the tag 'demo' and a DEMO- SKU.
-- Safe to run more than once. Remove with supabase/demo_cleanup.sql.
-- Prices are in kobo (NGN x 100). These are sample prices, not real ones.
-- =====================================================================
insert into public.product_categories (name, slug, sort_order) values
  ('Dresses','dresses',1), ('Tops','tops',2), ('Bottoms','bottoms',3),
  ('Sets','sets',4), ('Jumpsuits','jumpsuits',5), ('Accessories','accessories',6)
on conflict (slug) do nothing;

with demo(sku, name, slug, cat, price, disc, is_new, is_best, descr, colors, sizes) as (values
  ('DEMO-DR-001','Aria Midi Dress','aria-midi-dress','dresses',5800000,4900000,true,false,
   'Demo product. A fluid midi dress with a fitted bodice and soft drape.', array['Ivory','Black'], array['S','M','L']),
  ('DEMO-DR-002','Sable Slip Dress','sable-slip-dress','dresses',4500000,null,false,true,
   'Demo product. A bias-cut slip dress in a satin finish.', array['Black','Sand'], array['S','M','L']),
  ('DEMO-DR-003','Ivory Column Gown','ivory-column-gown','dresses',8500000,null,true,false,
   'Demo product. A floor-length column gown with a clean open back.', array['Ivory'], array['S','M','L']),
  ('DEMO-TP-001','Linen Cropped Shirt','linen-cropped-shirt','tops',2800000,null,false,true,
   'Demo product. A relaxed cropped shirt in washed linen.', array['Ivory','Sand'], array['S','M','L']),
  ('DEMO-TP-002','Silk Cami Top','silk-cami-top','tops',2400000,null,true,false,
   'Demo product. A lightweight cami with adjustable straps.', array['Black','Ivory'], array['S','M','L']),
  ('DEMO-TP-003','Structured Bodysuit','structured-bodysuit','tops',2200000,null,false,false,
   'Demo product. A sculpted bodysuit with a square neckline.', array['Black'], array['S','M','L']),
  ('DEMO-BT-001','Wide Leg Trousers','wide-leg-trousers','bottoms',3500000,null,false,true,
   'Demo product. High-waisted trousers with a fluid wide leg.', array['Black','Sand'], array['S','M','L']),
  ('DEMO-BT-002','Pleated Midi Skirt','pleated-midi-skirt','bottoms',3000000,2500000,true,false,
   'Demo product. A midi skirt with knife pleats and an elasticated back.', array['Ivory','Black'], array['S','M','L']),
  ('DEMO-ST-001','Two Piece Linen Set','two-piece-linen-set','sets',6200000,null,true,false,
   'Demo product. A matching linen top and trouser set.', array['Sand','Ivory'], array['S','M','L']),
  ('DEMO-ST-002','Knit Co-ord','knit-co-ord','sets',5500000,null,false,true,
   'Demo product. A soft knit top and skirt co-ord.', array['Black','Sand'], array['S','M','L']),
  ('DEMO-JS-001','Tailored Jumpsuit','tailored-jumpsuit','jumpsuits',6800000,null,false,false,
   'Demo product. A tailored jumpsuit with a defined waist.', array['Black','Ivory'], array['S','M','L']),
  ('DEMO-AC-001','Leather Belt','leather-belt','accessories',1500000,null,true,false,
   'Demo product. A slim leather belt with a brushed buckle.', array['Black','Tan'], array['One Size'])
), ins as (
  insert into public.products
    (sku, name, slug, description, category_id, price_minor, discount_price_minor,
     tags, is_new_arrival, is_best_seller, status)
  select d.sku, d.name, d.slug, d.descr, c.id, d.price, d.disc,
         array['demo'], d.is_new, d.is_best, 'published'
  from demo d join public.product_categories c on c.slug = d.cat
  on conflict (sku) do nothing
  returning id, sku
)
insert into public.product_variants (product_id, sku, size, color, stock_on_hand)
select p.id, p.sku || '-' || replace(s, ' ', '') || '-' || upper(left(c, 3)), s, c,
       case s when 'S' then 4 when 'M' then 6 when 'L' then 3 else 5 end
from ins p
join demo d on d.sku = p.sku
cross join lateral unnest(d.sizes) as s
cross join lateral unnest(d.colors) as c;

-- One sold-out variant and one low-stock variant, to exercise those states
update public.product_variants set stock_on_hand = 0 where sku = 'DEMO-DR-002-M-BLA';
update public.product_variants set stock_on_hand = 2 where sku = 'DEMO-TP-001-S-IVO';

insert into public.store_settings (key, value, is_public) values
  ('announcement', to_jsonb('DEMO STORE: sample products and images only. No real orders are fulfilled.'::text), true),
  ('promo_banner', to_jsonb('Demo promotional banner. Banners will be managed from the dashboard in a later step.'::text), true),
  ('brand_story',  to_jsonb('Demo brand story. Replace this text with the real 1903 story.'::text), true)
on conflict (key) do nothing;
