import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtempSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDb } from '../src/db.js'
import { createApp } from '../src/app.js'

let server, base, dir
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32, 1)])
const future = '2099-12-31 10:00:00'

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'operin-'))
  server = createServer(createApp({ db: openDb(':memory:'), uploadDir: dir, jwtSecret: 'test-secret' }))
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
async function signup(name) {
  const email = `${name.toLowerCase()}@del.ac.id`
  await call('POST', '/auth/register', { body: { name, email, password: 'rahasia1' } })
  const { data } = await call('POST', '/auth/login', { body: { email, password: 'rahasia1' } })
  return data.token
}
const image = (field) => { const f = new FormData(); f.append(field, new Blob([PNG], { type: 'image/png' }), 'a.png'); return f }

test('auth: register, duplikat, login salah, token wajib, logout mencabut token', async () => {
  assert.equal((await call('POST', '/auth/register', { body: { name: 'A', email: 'bukan-email', password: 'rahasia1' } })).code, 400)
  assert.equal((await call('POST', '/auth/register', { body: { name: 'A', email: 'a@x.id', password: '123' } })).code, 400)
  assert.equal((await call('POST', '/auth/register', { body: { name: 'Ani', email: 'ani@x.id', password: 'rahasia1' } })).status, 'success')
  assert.equal((await call('POST', '/auth/register', { body: { name: 'Ani', email: 'ANI@x.id', password: 'rahasia1' } })).message, 'Email sudah terdaftar')
  assert.equal((await call('POST', '/auth/login', { body: { email: 'ani@x.id', password: 'salah-salah' } })).status, 'fail')
  const { data } = await call('POST', '/auth/login', { body: { email: 'ani@x.id', password: 'rahasia1' } })
  assert.equal((await call('GET', '/users/me')).code, 401)
  assert.equal((await call('GET', '/users/me', { token: 'x.y.z' })).code, 401)
  const me = await call('GET', '/users/me', { token: data.token })
  assert.deepEqual([me.data.user.name, me.data.user.email, me.data.user.photo], ['Ani', 'ani@x.id', ''])
  assert.equal((await call('POST', '/auth/logout', { token: data.token })).status, 'success')
  assert.equal((await call('GET', '/users/me', { token: data.token })).code, 401)
})

test('users: daftar, ubah profil, ganti sandi, foto', async () => {
  const t = await signup('Budi')
  assert.ok((await call('GET', '/users', { token: t })).data.users.some((u) => u.name === 'Budi'))
  assert.equal((await call('PUT', '/users/me', { token: t, body: { name: 'Budi S', email: 'budi@del.ac.id' } })).status, 'success')
  assert.equal((await call('PUT', '/users/me', { token: t, body: { name: 'Budi', email: 'ani@x.id' } })).status, 'fail')
  const pw = { password: 'rahasia1', new_password: 'baru-baru', new_password_confirmation: 'beda-beda' }
  assert.equal((await call('PUT', '/users/password', { token: t, body: pw })).message, 'Konfirmasi kata sandi baru tidak cocok')
  assert.equal((await call('PUT', '/users/password', { token: t, body: { ...pw, password: 'salah-salah' } })).status, 'fail')
  assert.equal((await call('PUT', '/users/password', { token: t, body: { ...pw, new_password_confirmation: 'baru-baru' } })).status, 'success')
  assert.equal((await call('POST', '/auth/login', { body: { email: 'budi@del.ac.id', password: 'baru-baru' } })).status, 'success')
  const f = new FormData(); f.append('photo', new Blob(['bukan gambar'], { type: 'image/png' }), 'x.png')
  assert.equal((await call('POST', '/users/me/photo', { token: t, form: f })).status, 'fail')
  assert.equal((await call('POST', '/users/me/photo', { token: t, form: image('photo') })).status, 'success')
  const { user } = (await call('GET', '/users/me', { token: t })).data
  assert.match(user.photo, /\/uploads\/[0-9a-f]{32}\.png$/)
  const img = await fetch(user.photo)
  assert.equal(img.headers.get('content-type'), 'image/png')
  assert.equal((await fetch(`${base}/uploads/..%2f..%2fetc%2fpasswd`)).status, 404)
})

test('barang: validasi, CRUD, kepemilikan, filter, foto', async () => {
  const seller = await signup('Sari'), other = await signup('Dewi')
  const body = { title: 'Jaket Del', description: '**Bagus**', start_bid: 50000, closed_at: future }
  assert.equal((await call('POST', '/products', { token: seller, body: { ...body, title: '' } })).status, 'fail')
  assert.equal((await call('POST', '/products', { token: seller, body: { ...body, start_bid: -5 } })).status, 'fail')
  assert.equal((await call('POST', '/products', { token: seller, body: { ...body, closed_at: '2000-01-01 00:00:00' } })).status, 'fail')
  assert.equal((await call('POST', '/products', { token: seller, body: { ...body, closed_at: '2026-12-01T10:00' } })).status, 'fail')
  const created = await call('POST', '/products', { token: seller, body })
  assert.equal(created.code, 201)
  const id = created.data.product_id

  const detail = (await call('GET', `/products/${id}`, { token: other })).data.product
  assert.deepEqual([detail.title, detail.author.name, detail.bids, detail.my_bid, detail.cover], ['Jaket Del', 'Sari', [], null, ''])
  assert.equal((await call('GET', '/products/99999', { token: other })).code, 404)

  assert.equal((await call('PUT', `/products/${id}`, { token: other, body })).code, 403)
  assert.equal((await call('PUT', `/products/${id}`, { token: seller, body: { ...body, title: 'Jaket Baru' } })).status, 'success')
  assert.equal((await call('POST', `/products/${id}/cover`, { token: other, form: image('cover') })).code, 403)
  assert.equal((await call('POST', `/products/${id}/cover`, { token: seller, form: image('cover') })).status, 'success')
  assert.equal((await call('POST', `/products/${id}/cover`, { token: seller, form: image('salah') })).status, 'fail')
  const before = readdirSync(dir).length
  await call('POST', `/products/${id}/cover`, { token: seller, form: image('cover') })
  assert.equal(readdirSync(dir).length, before, 'foto lama harus dihapus saat diganti')

  const mine = (await call('GET', '/products?is_me=1', { token: seller })).data.products
  assert.ok(mine.length === 1 && mine[0].title === 'Jaket Baru' && mine[0].cover.startsWith('http'))
  assert.equal((await call('GET', '/products?is_me=1', { token: other })).data.products.length, 0)
  assert.equal((await call('GET', '/products?is_closed=1', { token: other })).data.products.length, 0)
  assert.equal((await call('GET', '/products?is_closed=0', { token: other })).data.products.length, 1)

  assert.equal((await call('DELETE', `/products/${id}`, { token: other })).code, 403)
  assert.equal((await call('DELETE', `/products/${id}`, { token: seller })).status, 'success')
  assert.equal((await call('GET', `/products/${id}`, { token: seller })).code, 404)
})

test('tawaran: aturan harga, satu per pengguna, batal, pemilik, ditutup', async () => {
  const seller = await signup('Rina'), a = await signup('Joko'), b = await signup('Tono')
  const { data } = await call('POST', '/products', { token: seller, body: { title: 'Sepatu', description: 'x', start_bid: 100000, closed_at: future } })
  const id = data.product_id
  const bid = (token, n) => call('POST', `/products/${id}/bids`, { token, body: { bid: n } })

  assert.equal((await bid(seller, 200000)).message, 'Anda tidak dapat menawar barang sendiri')
  assert.equal((await bid(a, 100000)).status, 'fail')
  assert.equal((await bid(a, 'abc')).status, 'fail')
  assert.equal((await bid(a, 150000)).code, 201)
  assert.equal((await bid(a, 160000)).status, 'fail')
  assert.equal((await bid(b, 150000)).status, 'fail')
  assert.equal((await bid(b, 175000)).code, 201)

  const asA = (await call('GET', `/products/${id}`, { token: a })).data.product
  assert.deepEqual(asA.bids.map((x) => x.bid), [175000, 150000])
  assert.equal(asA.bids[0].user.name, 'Tono')
  assert.equal(asA.my_bid.bid, 150000)

  assert.equal((await call('DELETE', `/products/${id}/bids`, { token: seller })).code, 404)
  assert.equal((await call('DELETE', `/products/${id}/bids`, { token: a })).status, 'success')
  assert.equal((await call('GET', `/products/${id}`, { token: a })).data.product.my_bid, null)

  assert.equal((await call('DELETE', '/products', { token: seller })).status, 'success')
  assert.equal((await call('GET', `/products/${id}`, { token: a })).code, 404)
})

test('barang yang sudah lewat waktunya ditutup untuk penawaran', async () => {
  // sisipkan langsung ke DB lewat server terpisah agar bisa membuat data kedaluwarsa
  const db = openDb(':memory:')
  const s = createServer(createApp({ db, uploadDir: dir, jwtSecret: 'k' }))
  await new Promise((r) => s.listen(0, r))
  const url = `http://127.0.0.1:${s.address().port}/api/v1`
  const j = async (m, p, t, body) => (await fetch(url + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t && { Authorization: `Bearer ${t}` }) }, body: body && JSON.stringify(body) })).json()
  for (const n of ['p', 'q']) await j('POST', '/auth/register', null, { name: n, email: `${n}@x.id`, password: 'rahasia1' })
  const tok = async (n) => (await j('POST', '/auth/login', null, { email: `${n}@x.id`, password: 'rahasia1' })).data.token
  db.prepare("INSERT INTO products (user_id, title, description, start_bid, closed_at) VALUES (1, 'Lama', 'x', 1000, '2000-01-01 00:00:00')").run()
  const q = await tok('q')
  assert.equal((await j('POST', '/products/1/bids', q, { bid: 5000 })).message, 'Penjualan barang sudah ditutup')
  assert.equal((await j('GET', '/products?is_closed=1', q)).data.products.length, 1)
  assert.equal((await j('GET', '/products?is_closed=0', q)).data.products.length, 0)
  s.close()
})

test('endpoint tak dikenal, metode salah, JSON rusak, CORS preflight', async () => {
  assert.equal((await call('GET', '/tidak-ada')).code, 404)
  assert.equal((await call('PATCH', '/auth/login')).code, 405)
  const res = await fetch(`${base}/api/v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{rusak' })
  assert.equal(res.status, 400)
  const pre = await fetch(`${base}/api/v1/products`, { method: 'OPTIONS' })
  assert.equal(pre.status, 204)
  assert.ok(pre.headers.get('access-control-allow-headers').includes('Authorization'))
})
