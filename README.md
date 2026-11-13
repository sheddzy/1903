# 1903 storefront: foundation and checkout API

Status: compiles, typechecks and builds; pages render correct empty states. Payment flow and storefront data NOT yet tested against Paystack or your Supabase project.

## Setup
1. npm install
2. Copy .env.example to .env.local and fill every value. Missing business values throw errors on purpose.
3. npm run dev

## What exists
- POST /api/checkout: validates input, calls create_order (DB decides prices and reserves stock), then starts Paystack or returns bank transfer details.
- POST /api/webhooks/paystack: verifies the HMAC-SHA512 signature, re-verifies with Paystack's API, then calls confirm_payment.
- /checkout/callback: customer return page. Runs the same server-side verification (safe to run twice).
- GET /api/track?order=...&email=...: customer-safe tracking via get_order_tracking.
- POST /api/admin/payments/confirm: staff confirm a bank transfer (amount must equal order total).
- middleware.ts + /admin/login: staff-only gate for /admin and /api/admin.

## Storefront and demo data
Run these in the Supabase SQL editor, in order:
1. supabase/migration_newsletter.sql (newsletter table)
2. supabase/demo_seed.sql (12 DEMO- products, 6 categories, demo banner text; safe to re-run)
Product images: until real photos are uploaded to the product-images bucket and rows are added to product_images,
the storefront shows tinted tiles labelled "Demo image". Remove all demo data later with supabase/demo_cleanup.sql.
Policy pages (FAQ, shipping, returns, privacy, terms) read store_settings keys policy_faq, policy_shipping,
policy_returns, policy_privacy, policy_terms (is_public = true). They show "not published yet" until you add text.
Pages: / /shop /category/[slug] /collections /product/[slug] /cart /checkout /track /about /contact /policies/[slug]

## Paystack setup
- Set the webhook URL in the Paystack dashboard to https://YOUR-DOMAIN/api/webhooks/paystack (test mode first).
- Local testing needs a public tunnel to receive webhooks.

## Reservation expiry (required)
Schedule in Supabase SQL editor (enable the pg_cron extension first):
  select cron.schedule('expire-reservations', '*/5 * * * *', 'select public.expire_reservations()');

## Test sequence before any real money
1. Paystack TEST keys. Checkout with one variant. Pay with a test card. Order becomes paid, stock drops once.
2. Replay the same webhook payload. Nothing changes (already_processed).
3. Abandon a payment. After the hold time plus the cron run, order is expired and stock is released.
4. Bank transfer: checkout, then call /api/admin/payments/confirm as staff with the right amount, then a wrong amount.
5. Try /api/admin/payments/confirm while signed out and as a customer. Both must be refused.

## Known gaps
- Not built yet: customer accounts and login, wishlist, discount codes at checkout, contact form, pre-order purchasing, homepage banner management, admin screens for products, inventory and orders.
- Size guide values and campaign copy are demo content.
- Rate limiter is in-memory (per instance). Replace with a shared store before launch.
- No emails yet. Shipping rule is two flat rates from env.
- Home page and /admin are temporary placeholders.
- Hosting not decided (Wasmer vs Netlify). Route handlers are standard Next.js, so test the webhook route on the chosen host first.
