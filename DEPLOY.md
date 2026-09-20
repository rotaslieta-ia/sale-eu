# SALE-EU v2 — Cloudflare deployment

## 1. Create the D1 database

Install Wrangler:

```bash
npm install -g wrangler
wrangler login
```

From the `worker` folder:

```bash
wrangler d1 create sale-eu
```

Copy the returned `database_id` into `worker/wrangler.toml`.

Apply the schema to your local DB:

```bash
wrangler d1 execute sale-eu --local --file=../database/schema.sql
```

Apply it to production:

```bash
wrangler d1 execute sale-eu --remote --file=../database/schema.sql
```

## 2. Configure the Worker

From `worker`:

```bash
wrangler secret put ADMIN_TOKEN
wrangler deploy
```

The deploy command prints a URL similar to:

`https://sale-eu-api.<your-subdomain>.workers.dev`

## 3. Connect the frontend

Open:

`frontend/script.js`

Change:

```js
const API_BASE_URL = "https://YOUR-WORKER.workers.dev";
```

to your actual Worker URL.

## 4. Test

Open:

`https://YOUR-WORKER.workers.dev/api/products`

You should receive JSON.

Then open the frontend locally or deploy it to Cloudflare Pages.

## 5. Real affiliate links

In the D1 `products` table, replace every demo `affiliate_url`.

Do not put private API keys in the frontend.

## 6. Admin statistics

Request:

`GET /api/admin/stats`

with header:

`X-Admin-Token: YOUR_SECRET`

This endpoint is intentionally protected.

## Architecture

- Cloudflare Pages = public SALE-EU frontend
- Cloudflare Worker = API + affiliate redirects
- Cloudflare D1 = products/categories/clicks
- GitHub = source control
