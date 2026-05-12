const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function parseArgs(argv) {
  const args = { file: path.join(__dirname, 'data', 'foods.json') };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file' && argv[i + 1]) {
      args.file = argv[i + 1];
      i++;
    }
  }
  return args;
}

function normalizeFood(item) {
  const name = (item?.name || '').toString().trim();
  const calories = Number(item?.calories_per_100g);
  const protein = Number(item?.protein_per_100g);
  const carbs = Number(item?.carbs_per_100g);
  const fat = Number(item?.fat_per_100g);

  if (!name) return null;
  if (![calories, protein, carbs, fat].every((n) => Number.isFinite(n))) return null;

  return {
    name,
    calories,
    protein,
    carbs,
    fat,
  };
}

async function main() {
  const { file } = parseArgs(process.argv);
  const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);

  if (!fs.existsSync(abs)) {
    console.error('File not found:', abs);
    process.exit(1);
  }

  const raw = fs.readFileSync(abs, 'utf8');
  let list;
  try {
    list = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(list)) {
    console.error('Expected an array in JSON file');
    process.exit(1);
  }

  const db = new sqlite3.Database('./fitness.db');

  const normalized = list.map(normalizeFood).filter(Boolean);
  console.log('Items in file:', list.length);
  console.log('Valid items:', normalized.length);

  await new Promise((resolve, reject) => {
    db.serialize(() => {
      // Upsert by name:
      // - if a food with the same name exists, update macro values
      // - otherwise insert a new row
      const stmt = db.prepare(
        `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(name) DO UPDATE SET
           calories_per_100g = excluded.calories_per_100g,
           protein_per_100g = excluded.protein_per_100g,
           carbs_per_100g = excluded.carbs_per_100g,
           fat_per_100g = excluded.fat_per_100g`
      );

      for (const f of normalized) {
        stmt.run([f.name, f.calories, f.protein, f.carbs, f.fat]);
      }
      stmt.finalize((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });

  const count = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS c FROM foods', (err, row) => {
      if (err) return reject(err);
      resolve(row.c);
    });
  });
  console.log('foods count:', count);

  db.close();
}

main().catch((e) => {
  console.error('Import failed:', e);
  process.exit(1);
});
