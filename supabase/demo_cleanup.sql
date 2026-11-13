-- Removes demo data. Works only while no order references demo variants.
-- If you have test orders, archive instead:
--   update public.products set status = 'archived' where 'demo' = any(tags);
delete from public.product_variants
  where product_id in (select id from public.products where 'demo' = any(tags));
delete from public.products where 'demo' = any(tags);
delete from public.store_settings where key in ('announcement','promo_banner','brand_story');
-- Categories are kept: they are real structure, manage them in the dashboard.
