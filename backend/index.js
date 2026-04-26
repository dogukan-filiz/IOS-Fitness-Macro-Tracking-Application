const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./fitness.db');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
