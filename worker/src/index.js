const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "Content-Type, X-Admin-Token",
      ...extra
    }
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "Content-Type, X-Admin-Token"
      }
    });

    try {
      // Public product catalog.
      if (url.pathname === "/api/products" && request.method === "GET") {
        const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);
        const q = (url.searchParams.get("q") || "").trim();
        const category = (url.searchParams.get("category") || "").trim();
        const platform = (url.searchParams.get("platform") || "").trim();

        let query = `
          SELECT p.id, p.name, p.slug, p.price, p.old_price, p.currency,
                 p.rating, p.review_count, p.discount_percent, p.platform,
                 p.emoji, p.is_deal, p.is_popular,
                 c.name AS category_name, c.slug AS category_slug
          FROM products p
          JOIN categories c ON c.id = p.category_id
          WHERE p.active = 1
        `;
        const binds = [];

        if (q) {
          query += " AND (p.name LIKE ? OR p.description LIKE ?)";
          binds.push(`%${q}%`, `%${q}%`);
        }
        if (category) {
          query += " AND c.slug = ?";
          binds.push(category);
        }
        if (platform) {
          query += " AND p.platform = ?";
          binds.push(platform);
        }

        query += " ORDER BY p.is_deal DESC, p.is_popular DESC, p.created_at DESC LIMIT ?";
        binds.push(limit);

        const { results } = await env.DB.prepare(query).bind(...binds).all();
        return json(results);
      }

      if (url.pathname === "/api/categories" && request.method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT c.id, c.name, c.slug, c.icon, COUNT(p.id) AS product_count
          FROM categories c
          LEFT JOIN products p ON p.category_id = c.id AND p.active = 1
          GROUP BY c.id
          ORDER BY c.sort_order ASC, c.name ASC
        `).all();
        return json(results);
      }

      // Affiliate redirect + click tracking.
      const go = url.pathname.match(/^\/go\/(\d+)$/);
      if (go && request.method === "GET") {
        const productId = Number(go[1]);
        const product = await env.DB.prepare(`
          SELECT id, affiliate_url FROM products WHERE id = ? AND active = 1
        `).bind(productId).first();

        if (!product || !product.affiliate_url) return new Response("Product not found", {status: 404});

        const referer = request.headers.get("Referer") || "";
        const country = request.cf?.country || "";

        await env.DB.prepare(`
          INSERT INTO clicks (product_id, clicked_at, referrer, country)
          VALUES (?, datetime('now'), ?, ?)
        `).bind(productId, referer.slice(0, 500), country).run();

        return Response.redirect(product.affiliate_url, 302);
      }

      // Simple protected admin statistics endpoint.
      if (url.pathname === "/api/admin/stats" && request.method === "GET") {
        const token = request.headers.get("X-Admin-Token");
        if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) return json({error:"Unauthorized"}, 401);

        const totals = await env.DB.prepare(`
          SELECT COUNT(*) AS clicks,
                 COUNT(DISTINCT product_id) AS products_clicked
          FROM clicks
        `).first();

        const today = await env.DB.prepare(`
          SELECT COUNT(*) AS clicks
          FROM clicks
          WHERE clicked_at >= datetime('now','start of day')
        `).first();

        const top = await env.DB.prepare(`
          SELECT p.id, p.name, COUNT(c.id) AS clicks
          FROM clicks c
          JOIN products p ON p.id = c.product_id
          GROUP BY p.id
          ORDER BY clicks DESC
          LIMIT 10
        `).all();

        return json({totals, today, top: top.results});
      }

      return json({service:"SALE-EU API", status:"ok"});
    } catch (error) {
      console.error(error);
      return json({error:"Internal server error"}, 500);
    }
  }
};
