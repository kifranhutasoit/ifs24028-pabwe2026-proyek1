import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtempSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDb, ensureAdmin } from '../src/db.js'
import { createApp } from '../src/app.js'

let server, base, dir, db
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32, 1)])
const future = '2099-12-31 10:00:00'

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'operin-admin-'))
  db = openDb(':memory:')
  server = createServer(createApp({ db, uploadDir: dir, jwtSecret: 'test-secret' }))
  await new Promise((r) => server.listen(0, r))
  base = `http://127.0.0.1:${server.address().port}`
})
after(() => { server.close(); rmSync(dir, { recursive: true, force: true }) })

async function call(method, path, { token, body, form } = {}) {
  const res = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: { ...(token && { Authorization: `Bearer ${token}` }), ...(body && { 'Content-Type': 'application/json' }) },
    body: form ?? (body && JSON.stringify(body)),
  })
  return { code: res.status, ...(await res.json()) }
}
const login = async (email, password = 'rahasia1') => (await call('POST', '/auth/login', { body: { email, password } })).data?.token
async function signup(name) {
  const email = `${name.toLowerCase()}@del.ac.id`
  await call('POST', '/auth/register', { body: { name, email, password: 'rahasia1' } })
  return { token: await login(email), email }
}
const userId = async (token) => (await call('GET', '/users/me', { token })).data.user.id

test('ensureAdmin membuat akun baru, lalu menaikkan akun yang sudah ada', async () => {
  assert.equal(ensureAdmin(db, { email: 'Admin@Operin.local', password: 'admin123' }), 'dibuat')
  assert.equal(ensureAdmin(db, { email: 'admin@operin.local', password: 'apapun' }), 'dinaikkan')
  const token = await login('admin@operin.local', 'admin123')
  const me = (await call('GET', '/users/me', { token })).data.user
  assert.equal(me.role, 'admin')
  const biasa = await signup('Biasa')
  assert.equal((await call('GET', '/users/me', { token: biasa.token })).data.user.role, 'user')
  ensureAdmin(db, { email: biasa.email, password: 'x' })
  assert.equal((await call('GET', '/users/me', { token: biasa.token })).data.user.role, 'admin')
})

test('endpoint admin ditolak untuk pengguna biasa dan tamu', async () => {
  const u = await signup('Warga')
  for (const [m, p] of [['GET', '/admin/stats'], ['GET', '/admin/users'], ['PUT', '/admin/users/1'], ['DELETE', '/admin/users/1']]) {
    assert.equal((await call(m, p, { token: u.token, body: m === 'PUT' ? {} : undefined })).code, 403, `${m} ${p}`)
    assert.equal((await call(m, p)).code, 401)
  }
})

test('kategori: default, validasi, ubah, dan filter', async () => {
  const u = await signup('Penjual')
  const body = { title: 'Laptop', description: 'x', start_bid: 1000, closed_at: future }
  assert.equal((await call('POST', '/products', { token: u.token, body: { ...body, category: 'Mobil' } })).message, 'Kategori tidak valid')
  const a = (await call('POST', '/products', { token: u.token, body })).data.product_id
  const b = (await call('POST', '/products', { token: u.token, body: { ...body, title: 'Novel', category: 'Buku' } })).data.product_id
  assert.equal((await call('GET', `/products/${a}`, { token: u.token })).data.product.category, 'Lainnya')
  assert.equal((await call('PUT', `/products/${a}`, { token: u.token, body: { ...body, category: 'Elektronik' } })).status, 'success')
  const only = async (c) => (await call('GET', `/products?category=${c}`, { token: u.token })).data.products.map((p) => p.id)
  assert.deepEqual(await only('Elektronik'), [a])
  assert.deepEqual(await only('Buku'), [b])
  assert.equal((await call('GET', '/products?category=Ngawur', { token: u.token })).data.products.length >= 2, true)
})

test('admin: statistik, daftar pengguna, ubah peran, nonaktifkan, hapus', async () => {
  const admin = await login('admin@operin.local', 'admin123')
  const target = await signup('Target')
  const tid = await userId(target.token)
  const adminId = await userId(admin)

  const stats = (await call('GET', '/admin/stats', { token: admin })).data.stats
  assert.ok(stats.users >= 3 && stats.admins >= 1 && stats.products >= 2)
  assert.equal(stats.by_category.length, 6)
  assert.equal(stats.products, stats.products_open + stats.products_closed)

  const list = (await call('GET', '/admin/users', { token: admin })).data.users
  const row = list.find((u) => u.id === tid)
  assert.deepEqual([row.role, row.is_active, row.product_count, row.bid_count], ['user', true, 0, 0])

  assert.equal((await call('PUT', `/admin/users/${adminId}`, { token: admin, body: { is_active: false } })).message, 'Anda tidak dapat mengubah akun Anda sendiri')
  assert.equal((await call('PUT', '/admin/users/99999', { token: admin, body: {} })).code, 404)
  assert.equal((await call('PUT', `/admin/users/${tid}`, { token: admin, body: { role: 'raja' } })).status, 'fail')
  assert.equal((await call('PUT', `/admin/users/${tid}`, { token: admin, body: { is_active: 'ya' } })).status, 'fail')

  assert.equal((await call('PUT', `/admin/users/${tid}`, { token: admin, body: { is_active: false } })).status, 'success')
  assert.equal((await call('GET', '/users/me', { token: target.token })).code, 401, 'token lama langsung tidak berlaku')
  const blocked = await call('POST', '/auth/login', { body: { email: target.email, password: 'rahasia1' } })
  assert.equal(blocked.code, 403)
  assert.equal(blocked.message, 'Akun Anda dinonaktifkan oleh admin')
  assert.equal((await call('PUT', `/admin/users/${tid}`, { token: admin, body: { is_active: true, role: 'admin' } })).status, 'success')
  assert.equal((await call('GET', '/users/me', { token: await login(target.email) })).data.user.role, 'admin')

  assert.equal((await call('DELETE', `/admin/users/${adminId}`, { token: admin })).code, 400)
  assert.equal((await call('DELETE', '/admin/users/99999', { token: admin })).code, 404)
})

test('admin menghapus pengguna beserta barang dan filenya, serta menghapus barang siapa pun', async () => {
  const admin = await login('admin@operin.local', 'admin123')
  const seller = await signup('Nakal')
  const sid = await userId(seller.token)
  const make = async (title) => (await call('POST', '/products', { token: seller.token, body: { title, description: 'x', start_bid: 500, closed_at: future } })).data.product_id
  const p1 = await make('Barang A'), p2 = await make('Barang B')
  const f = new FormData(); f.append('cover', new Blob([PNG], { type: 'image/png' }), 'a.png')
  await call('POST', `/products/${p1}/cover`, { token: seller.token, form: f })
  const filesBefore = readdirSync(dir).length

  const other = await signup('Pembeli')
  assert.equal((await call('DELETE', `/products/${p2}`, { token: other.token })).code, 403)
  assert.equal((await call('DELETE', `/products/${p2}`, { token: admin })).status, 'success')
  assert.equal((await call('GET', `/products/${p2}`, { token: admin })).code, 404)

  assert.equal((await call('DELETE', `/admin/users/${sid}`, { token: admin })).status, 'success')
  assert.equal((await call('GET', `/products/${p1}`, { token: admin })).code, 404)
  assert.equal(readdirSync(dir).length, filesBefore - 1, 'foto barang ikut terhapus')
  assert.equal((await call('GET', '/users/me', { token: seller.token })).code, 401)
})

test('migrasi menambah kolom baru pada database lama tanpa menghilangkan data', async () => {
  const { DatabaseSync } = await import('node:sqlite')
  const file = join(dir, 'lama.db')
  const old = new DatabaseSync(file)
  old.exec(`CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, photo TEXT, created_at TEXT NOT NULL DEFAULT 'x');
    CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, start_bid INTEGER NOT NULL, closed_at TEXT NOT NULL, cover TEXT, created_at TEXT NOT NULL DEFAULT 'x');
    INSERT INTO users (name, email, password_hash) VALUES ('Lama', 'lama@x.id', 'h');
    INSERT INTO products (user_id, title, description, start_bid, closed_at) VALUES (1, 'Jam', 'd', 1000, '2099-01-01 00:00:00');`)
  old.close()
  const migrated = openDb(file)
  assert.deepEqual({ ...migrated.prepare('SELECT role, is_active FROM users').get() }, { role: 'user', is_active: 1 })
  assert.equal(migrated.prepare('SELECT category FROM products').get().category, 'Lainnya')
  migrated.close()
  openDb(file).close() // dijalankan dua kali tidak boleh error
})
