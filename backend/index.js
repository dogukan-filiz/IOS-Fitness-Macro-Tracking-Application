const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const https = require('https');

const app = express();
app.use(express.json());
app.use(cors());

// Basic request logger (helps debug Expo Go / LAN connectivity)
app.use((req, _res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${ip}`);
  next();
});

const db = new sqlite3.Database('./fitness.db');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// --- Week 7: Weights ---
// Lightweight migration at startup.
db.serialize(() => {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS weights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      weight REAL NOT NULL,
      entry_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `
  );
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_weights_user_date ON weights(user_id, entry_date)`);
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Eksik alan' });
  const hash = await bcrypt.hash(password, 10);
  const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
  stmt.run([name, email, hash], function (err) {
    if (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'E-posta zaten kayıtlı' });
      }
      return res.status(500).json({ error: 'DB hatası' });
    }
    const user = { id: this.lastID, name, email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ user, token });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Eksik alan' });
  db.get('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: 'DB hatası' });
    if (!row) return res.status(401).json({ error: 'E-posta veya şifre yanlış' });
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) return res.status(401).json({ error: 'E-posta veya şifre yanlış' });
    const user = { id: row.id, name: row.name, email: row.email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user, token });
  });
});

// Create/update a weight entry for a given date (upsert by user_id + entry_date)
app.post('/api/weights', authenticate, (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const weight = Number(req.body?.weight);
  const date = (req.body?.date || '').toString().trim();
  const safeDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);

  if (!Number.isFinite(weight)) return res.status(400).json({ error: 'weight sayısal olmalı' });
  if (weight < 20 || weight > 300) return res.status(400).json({ error: 'weight 20-300 aralığında olmalı' });

  const sql = `
    INSERT INTO weights (user_id, weight, entry_date, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, entry_date)
    DO UPDATE SET
      weight = excluded.weight,
      updated_at = datetime('now')
  `;

  db.run(sql, [userId, weight, safeDate], function (err) {
    if (err) return res.status(500).json({ error: 'DB hatası' });
    return res.status(201).json({ entry: { user_id: userId, weight, date: safeDate } });
  });
});

// List all weights for the authenticated user
app.get('/api/weights', authenticate, (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  db.all(
    `SELECT id, weight, entry_date AS date, created_at, updated_at
     FROM weights
     WHERE user_id = ?
     ORDER BY entry_date ASC, id ASC`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB hatası' });
      const entries = (rows || []).map((r) => ({
        id: r.id,
        weight: Number(r.weight || 0),
        date: r.date,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));
      return res.json({ entries });
    }
  );
});

// Auth middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('AUTH HEADER:', authHeader);
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('JWT verify error', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

// Protected profile route
app.get('/api/me', authenticate, (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  db.get('SELECT id, name, email FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB hatası' });
    if (!row) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    return res.json({ user: row });
  });
});

// --- Week 5: Foods & entries ---

// List foods, optional search via ?q=
app.get('/api/foods', authenticate, (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const limit = Math.min(parseInt((req.query.limit || '50').toString(), 10) || 50, 200);

  const sql = q
    ? `SELECT id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g
       FROM foods
       WHERE lower(name) LIKE ?
       ORDER BY name ASC
       LIMIT ?`
    : `SELECT id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g
       FROM foods
       ORDER BY name ASC
       LIMIT ?`;

  const params = q ? [`%${q.toLowerCase()}%`, limit] : [limit];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB hatası' });
    return res.json({ foods: rows || [] });
  });
});

// Add a food entry for the authenticated user
app.post('/api/food-entries', authenticate, (req, res) => {
  const userId = req.user && req.user.id;
  const { foodId, grams, date, offProduct } = req.body || {};
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const parsedFoodId = Number(foodId);
  const parsedGrams = Number(grams);
  const entryDate = (date || '').toString().trim();

  // If offProduct is provided, we'll cache it into foods table and use its id.
  // offProduct shape: { sourceId, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g }
  const isOff = !!offProduct && typeof offProduct === 'object';
  if (!isOff && (!parsedFoodId || Number.isNaN(parsedFoodId))) return res.status(400).json({ error: 'foodId geçersiz' });
  if (!parsedGrams || Number.isNaN(parsedGrams) || parsedGrams <= 0) return res.status(400).json({ error: 'grams geçersiz' });
  // Expect YYYY-MM-DD; if not provided, default to today
  const safeDate = entryDate && /^\d{4}-\d{2}-\d{2}$/.test(entryDate) ? entryDate : new Date().toISOString().slice(0, 10);

  function insertEntry(food_id) {
    const stmt = db.prepare('INSERT INTO food_entries (user_id, food_id, grams, entry_date) VALUES (?, ?, ?, ?)');
    stmt.run([userId, food_id, parsedGrams, safeDate], function (err2) {
      if (err2) return res.status(500).json({ error: 'DB hatası' });
      return res
        .status(201)
        .json({ entry: { id: this.lastID, user_id: userId, food_id, grams: parsedGrams, entry_date: safeDate } });
    });
  }

  if (isOff) {
    const sourceId = (offProduct.sourceId || '').toString().trim();
    const name = (offProduct.name || '').toString().trim();
    const calories = Number(offProduct.calories_per_100g);
    const protein = Number(offProduct.protein_per_100g);
    const carbs = Number(offProduct.carbs_per_100g);
    const fat = Number(offProduct.fat_per_100g);

    if (!sourceId || !name) return res.status(400).json({ error: 'offProduct geçersiz' });
    if (![calories, protein, carbs, fat].every((n) => Number.isFinite(n))) return res.status(400).json({ error: 'offProduct makroları eksik' });

    // Try to find existing cached food
    db.get('SELECT id FROM foods WHERE source = ? AND source_id = ?', ['off', sourceId], (err, cached) => {
      if (err) return res.status(500).json({ error: 'DB hatası' });
      if (cached?.id) return insertEntry(cached.id);

      const stmt = db.prepare(
        `INSERT OR IGNORE INTO foods (name, source, source_id, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run([name, 'off', sourceId, calories, protein, carbs, fat], function (err2) {
        if (err2) return res.status(500).json({ error: 'DB hatası' });

        // If insert was ignored because of unique(name), fetch the row by name
        const insertedId = this.lastID;
        if (insertedId) return insertEntry(insertedId);
        db.get('SELECT id FROM foods WHERE name = ?', [name], (err3, byName) => {
          if (err3) return res.status(500).json({ error: 'DB hatası' });
          if (!byName?.id) return res.status(500).json({ error: 'Besin cache edilemedi' });
          return insertEntry(byName.id);
        });
      });
    });
    return;
  }

  db.get('SELECT id FROM foods WHERE id = ?', [parsedFoodId], (err, foodRow) => {
    if (err) return res.status(500).json({ error: 'DB hatası' });
    if (!foodRow) return res.status(404).json({ error: 'Besin bulunamadı' });
    return insertEntry(parsedFoodId);
  });
});

function httpsJson(url, { timeoutMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        // OpenFoodFacts blocks/rate-limits requests without a User-Agent and
        // then serves an HTML error page, which breaks JSON.parse. A proper
        // UA + Accept header keeps the API returning JSON.
        headers: {
          'User-Agent': 'FitnessMacroTracker/1.0 (educational project)',
          Accept: 'application/json',
        },
      },
      (resp) => {
        const status = resp.statusCode || 0;
        let data = '';
        resp.on('data', (chunk) => (data += chunk));
        resp.on('end', () => {
          if (status < 200 || status >= 300) {
            return reject(new Error(`Upstream HTTP ${status}`));
          }
          const trimmed = data.trim();
          // Guard against HTML error pages (rate-limit, maintenance, redirect).
          if (!trimmed || trimmed[0] === '<') {
            return reject(new Error('Upstream returned non-JSON response'));
          }
          try {
            resolve(JSON.parse(trimmed));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('Upstream request timed out'));
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// OpenFoodFacts' legacy search endpoint is heavily rate-limited and returns
// transient 503s. Retry a couple of times with backoff so a single user
// search succeeds reliably.
async function httpsJsonWithRetry(url, { retries = 2, timeoutMs = 8000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await httpsJson(url, { timeoutMs });
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await sleep(400 * (attempt + 1));
    }
  }
  throw lastErr;
}

// OpenFoodFacts proxy search
// Returns items in our Food shape + source info
app.get('/api/foods/search', authenticate, async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const pageSize = Math.min(parseInt((req.query.pageSize || '20').toString(), 10) || 20, 50);
  if (!q) return res.status(400).json({ error: 'q gerekli' });

  try {
    const url =
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}` +
      `&search_simple=1&action=process&json=1&page_size=${pageSize}` +
      `&fields=code,product_name,nutriments`;

    const json = await httpsJsonWithRetry(url);
    const products = Array.isArray(json?.products) ? json.products : [];

    const items = products
      .map((p) => {
        const nutr = p?.nutriments || {};
        const caloriesKcal = Number(nutr['energy-kcal_100g'] ?? nutr['energy-kcal'] ?? nutr['energy-kcal_value']);
        const protein = Number(nutr['proteins_100g']);
        const carbs = Number(nutr['carbohydrates_100g']);
        const fat = Number(nutr['fat_100g']);
        const name = (p?.product_name || '').toString().trim();
        const code = (p?.code || '').toString().trim();

        if (!name || !code) return null;
        if (![caloriesKcal, protein, carbs, fat].every((n) => Number.isFinite(n))) return null;

        return {
          source: 'off',
          sourceId: code,
          name,
          calories_per_100g: caloriesKcal,
          protein_per_100g: protein,
          carbs_per_100g: carbs,
          fat_per_100g: fat,
        };
      })
      .filter(Boolean);

    return res.json({ items });
  } catch (e) {
    console.warn('OpenFoodFacts search error', e);
    return res.status(502).json({ error: 'Dış besin servisine şu an ulaşılamıyor. Lütfen tekrar deneyin.' });
  }
});

// Daily totals for calories + macros
app.get('/api/daily-summary', authenticate, (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const date = (req.query.date || '').toString().trim();
  const safeDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);

  const sql = `
    SELECT
      COALESCE(SUM(f.calories_per_100g * e.grams / 100.0), 0) AS calories,
      COALESCE(SUM(f.protein_per_100g  * e.grams / 100.0), 0) AS protein,
      COALESCE(SUM(f.carbs_per_100g    * e.grams / 100.0), 0) AS carbs,
      COALESCE(SUM(f.fat_per_100g      * e.grams / 100.0), 0) AS fat,
      COALESCE(SUM(e.grams), 0) AS total_grams,
      COUNT(e.id) AS items
    FROM food_entries e
    JOIN foods f ON f.id = e.food_id
    WHERE e.user_id = ? AND e.entry_date = ?
  `;

  db.get(sql, [userId, safeDate], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB hatası' });
    const summary = {
      date: safeDate,
      calories: Number(row?.calories || 0),
      protein: Number(row?.protein || 0),
      carbs: Number(row?.carbs || 0),
      fat: Number(row?.fat || 0),
      total_grams: Number(row?.total_grams || 0),
      items: Number(row?.items || 0),
    };
    return res.json({ summary });
  });
});

// Week 6: List daily food entries for selected date
// Returns per-entry computed macros based on grams.
app.get('/api/food-entries/daily', authenticate, (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const date = (req.query.date || '').toString().trim();
  const safeDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);

  const sql = `
    SELECT
      e.id,
      e.entry_date,
      e.grams,
      f.id AS food_id,
      f.name AS food_name,
      (f.calories_per_100g * e.grams / 100.0) AS calories,
      (f.protein_per_100g  * e.grams / 100.0) AS protein,
      (f.carbs_per_100g    * e.grams / 100.0) AS carbs,
      (f.fat_per_100g      * e.grams / 100.0) AS fat
    FROM food_entries e
    JOIN foods f ON f.id = e.food_id
    WHERE e.user_id = ? AND e.entry_date = ?
    ORDER BY e.created_at DESC, e.id DESC
  `;

  db.all(sql, [userId, safeDate], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB hatası' });
    const entries = (rows || []).map((r) => ({
      id: r.id,
      date: r.entry_date,
      grams: Number(r.grams || 0),
      food: {
        id: r.food_id,
        name: r.food_name,
      },
      calories: Number(r.calories || 0),
      protein: Number(r.protein || 0),
      carbs: Number(r.carbs || 0),
      fat: Number(r.fat || 0),
    }));
    return res.json({ date: safeDate, entries });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
