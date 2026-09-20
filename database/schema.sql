PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '🛍️',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  price REAL NOT NULL,
  old_price REAL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  platform TEXT NOT NULL CHECK(platform IN ('amazon','aliexpress')),
  affiliate_url TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  emoji TEXT DEFAULT '🛍️',
  is_deal INTEGER NOT NULL DEFAULT 0,
  is_popular INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

CREATE TABLE IF NOT EXISTS clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  clicked_at TEXT NOT NULL DEFAULT (datetime('now')),
  referrer TEXT DEFAULT '',
  country TEXT DEFAULT '',
  FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_clicks_product ON clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_clicks_date ON clicks(clicked_at);

INSERT OR IGNORE INTO categories (name, slug, icon, sort_order) VALUES
('Elektronika','elektronika','💻',1),
('Mājai','maja','🏠',2),
('Telefoni','telefoni','📱',3),
('Mode','mode','👕',4),
('Gaming','gaming','🎮',5),
('Auto','auto','🚗',6),
('Instrumenti','instrumenti','🛠️',7),
('Dāvanas','davanas','🎁',8);

-- Demo data. Replace affiliate_url values with your real affiliate URLs.
INSERT OR IGNORE INTO products
(category_id,name,slug,description,price,old_price,rating,review_count,discount_percent,platform,affiliate_url,emoji,is_deal,is_popular)
SELECT id,'Bezvadu austiņas TWS Pro','tws-pro','Demo produkts',19.99,36.50,4.7,2341,45,'amazon','https://example.com/replace-me/tws','🎧',1,1 FROM categories WHERE slug='elektronika';

INSERT OR IGNORE INTO products
(category_id,name,slug,description,price,old_price,rating,review_count,discount_percent,platform,affiliate_url,emoji,is_deal,is_popular)
SELECT id,'Viedpulkstenis Smart Watch','smart-watch','Demo produkts',26.99,39.99,4.8,1892,32,'aliexpress','https://example.com/replace-me/watch','⌚',1,1 FROM categories WHERE slug='telefoni';

INSERT OR IGNORE INTO products
(category_id,name,slug,description,price,old_price,rating,review_count,discount_percent,platform,affiliate_url,emoji,is_deal,is_popular)
SELECT id,'Sporta apavi','sporta-apavi','Demo produkts',24.90,41.90,4.8,3104,40,'aliexpress','https://example.com/replace-me/shoes','👟',1,1 FROM categories WHERE slug='mode';

INSERT OR IGNORE INTO products
(category_id,name,slug,description,price,old_price,rating,review_count,discount_percent,platform,affiliate_url,emoji,is_deal,is_popular)
SELECT id,'Power Bank 20000mAh','power-bank-20000','Demo produkts',14.99,23.99,4.5,1276,38,'amazon','https://example.com/replace-me/powerbank','🔋',1,0 FROM categories WHERE slug='elektronika';

INSERT OR IGNORE INTO products
(category_id,name,slug,description,price,old_price,rating,review_count,discount_percent,platform,affiliate_url,emoji,is_deal,is_popular)
SELECT id,'PS5 DualSense kontrolieris','ps5-dualsense','Demo produkts',49.99,66.99,4.7,1933,25,'amazon','https://example.com/replace-me/ps5','🎮',0,1 FROM categories WHERE slug='gaming';

INSERT OR IGNORE INTO products
(category_id,name,slug,description,price,old_price,rating,review_count,discount_percent,platform,affiliate_url,emoji,is_deal,is_popular)
SELECT id,'Bluetooth skaļrunis','bluetooth-skallrunis','Demo produkts',39.90,62.99,4.6,2411,37,'aliexpress','https://example.com/replace-me/speaker','🔊',1,1 FROM categories WHERE slug='elektronika';
