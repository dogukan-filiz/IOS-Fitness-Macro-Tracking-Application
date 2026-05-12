const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./fitness.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
    source TEXT,
    source_id TEXT,
      calories_per_100g REAL NOT NULL,
      protein_per_100g REAL NOT NULL,
      carbs_per_100g REAL NOT NULL,
      fat_per_100g REAL NOT NULL
    )
  `);

  // Lightweight migration for existing DBs created without source/source_id
  db.run(`ALTER TABLE foods ADD COLUMN source TEXT`, () => {});
  db.run(`ALTER TABLE foods ADD COLUMN source_id TEXT`, () => {});
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_foods_source_source_id ON foods(source, source_id)`, () => {});

  db.run(`
    CREATE TABLE IF NOT EXISTS food_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      food_id INTEGER NOT NULL,
      grams REAL NOT NULL,
      entry_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (food_id) REFERENCES foods(id)
    )
  `);

  // Seed foods (idempotent, safe to run multiple times)
  const seedFoods = [
    ['Tavuk Göğsü (Pişmiş)', 165, 31, 0, 3.6],
    ['Pirinç (Pişmiş)', 130, 2.4, 28.2, 0.3],
    ['Yulaf Ezmesi', 389, 16.9, 66.3, 6.9],
    ['Yumurta', 155, 13, 1.1, 11],
    ['Süt (Yağlı)', 61, 3.2, 4.8, 3.3],
    ['Muz', 89, 1.1, 22.8, 0.3],
    ['Zeytinyağı', 884, 0, 0, 100],
    ['Ton Balığı (Konserve)', 116, 26, 0, 1],
    ['Yoğurt (Sade)', 61, 3.5, 4.7, 3.3],
    ['Badem', 579, 21.2, 21.6, 49.9],
    ['Elma', 52, 0.3, 14, 0.2],
  ['Ekmek (Beyaz)', 265, 9, 49, 3.2],

  // Protein kaynakları
  ['Hindi Göğsü (Pişmiş)', 135, 29, 0, 1.6],
  ['Kırmızı Et (Yağsız, Pişmiş)', 217, 26, 0, 12],
  ['Somon (Pişmiş)', 208, 20, 0, 13],
  ['Mercimek (Haşlanmış)', 116, 9, 20, 0.4],
  ['Nohut (Haşlanmış)', 164, 8.9, 27.4, 2.6],
  ['Fasulye (Haşlanmış)', 127, 8.7, 22.8, 0.5],
  ['Lor Peyniri', 98, 11, 3, 4.3],
  ['Beyaz Peynir', 264, 14, 4, 21],
  ['Kaşar Peyniri', 404, 25, 1.3, 33],

  // Karbonhidrat kaynakları
  ['Ekmek (Tam Buğday)', 247, 13, 41, 4.2],
  ['Makarna (Pişmiş)', 131, 5, 25, 1.1],
  ['Bulgur (Pişmiş)', 83, 3.1, 18.6, 0.2],
  ['Patates (Haşlanmış)', 87, 1.9, 20.1, 0.1],
  ['Tatlı Patates (Pişmiş)', 90, 2, 21, 0.2],
  ['Ekmek (Çavdar)', 259, 9, 48, 3.3],
  ['Mısır (Haşlanmış)', 96, 3.4, 21, 1.5],
  ['Kinoa (Pişmiş)', 120, 4.4, 21.3, 1.9],

  // Sebze & meyve
  ['Domates', 18, 0.9, 3.9, 0.2],
  ['Salatalık', 15, 0.7, 3.6, 0.1],
  ['Marul', 15, 1.4, 2.9, 0.2],
  ['Ispanak', 23, 2.9, 3.6, 0.4],
  ['Brokoli (Haşlanmış)', 35, 2.4, 7.2, 0.4],
  ['Havuç', 41, 0.9, 9.6, 0.2],
  ['Portakal', 47, 0.9, 11.8, 0.1],
  ['Çilek', 32, 0.7, 7.7, 0.3],
  ['Avokado', 160, 2, 8.5, 14.7],

  // Yağ / kuruyemiş
  ['Ceviz', 654, 15.2, 13.7, 65.2],
  ['Fındık', 628, 15, 16.7, 60.8],
  ['Fıstık Ezmesi', 588, 25, 20, 50],
  ['Tereyağı', 717, 0.9, 0.1, 81],

  // İçecek / ek
  ['Kefir', 52, 3.3, 4, 2.9],
  ['Ayran', 37, 2.2, 2.6, 2.1],
  ['Şekersiz Türk Kahvesi', 1, 0.1, 0, 0],
  ['Çay (Şekersiz)', 1, 0, 0.2, 0],

  // Basit atıştırmalıklar (yaklaşık değerler)
  ['Bitter Çikolata (%70+)', 600, 7.8, 46, 43],
  ['Bal', 304, 0.3, 82.4, 0],
  ['Reçel', 250, 0.2, 65, 0.1]
  ];
  const stmt = db.prepare(
  `INSERT OR IGNORE INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
   VALUES (?, ?, ?, ?, ?)`
  );
  for (const food of seedFoods) stmt.run(food);
  stmt.finalize();

  console.log('DB initialized');
});

db.close();
