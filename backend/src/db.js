import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { hashPassword } from './security.js'

const SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  photo TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_bid INTEGER NOT NULL,
  closed_at TEXT NOT NULL,
  cover TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE TABLE IF NOT EXISTS bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bid INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (product_id, user_id)
);
CREATE TABLE IF NOT EXISTS revoked_tokens (jti TEXT PRIMARY KEY);
`

// Migrasi ringan: tambah kolom baru pada database lama tanpa menghapus data.
function ensureColumn(db, table, column, definition) {
  const exists = db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column)
  if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
}

export function openDb(file = ':memory:') {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(SCHEMA)
  ensureColumn(db, 'users', 'role', "TEXT NOT NULL DEFAULT 'user'")
  ensureColumn(db, 'users', 'is_active', 'INTEGER NOT NULL DEFAULT 1')
  ensureColumn(db, 'products', 'category', "TEXT NOT NULL DEFAULT 'Lainnya'")
  return db
}

// Membuat akun admin (atau menaikkan akun yang sudah ada menjadi admin).
export function ensureAdmin(db, { name = 'Administrator', email, password }) {
  const mail = email.trim().toLowerCase()
  const found = db.prepare('SELECT id FROM users WHERE email = ?').get(mail)
  if (found) {
    db.prepare("UPDATE users SET role = 'admin', is_active = 1 WHERE id = ?").run(found.id)
    return 'dinaikkan'
  }
  db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')").run(name, mail, hashPassword(password))
  return 'dibuat'
}
