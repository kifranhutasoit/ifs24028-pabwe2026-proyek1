import { randomBytes } from 'node:crypto'
import { mkdirSync, existsSync, createReadStream, writeFileSync, unlinkSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import { hashPassword, checkPassword, signToken, verifyToken } from './security.js'
import { parseMultipart, detectImageExt } from './multipart.js'

const MAX_JSON = 1024 * 1024
const MAX_UPLOAD = 2 * 1024 * 1024
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIMESTAMP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
const MIME = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' }

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}
const fail = (status, message) => { throw new HttpError(status, message) }

export function createApp({ db, uploadDir, jwtSecret, publicUrl = '', timeZone = 'Asia/Jakarta', corsOrigin = '*' }) {
  mkdirSync(uploadDir, { recursive: true })

  // ---------- util ----------
  const nowLocal = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date()).map((x) => [x.type, x.value]))
    return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`
  }
  const isClosed = (closedAt) => closedAt <= nowLocal()
  const baseUrl = (req) => publicUrl || `http://${req.headers.host}`
  const fileUrl = (req, name) => (name ? `${baseUrl(req)}/uploads/${name}` : '')
  const removeFile = (name) => { if (name) try { unlinkSync(join(uploadDir, basename(name))) } catch { /* sudah hilang */ } }

  const publicUser = (req, u) => ({ id: u.id, name: u.name, email: u.email, photo: fileUrl(req, u.photo) })
  const author = (req, row) => ({ id: row.user_id, name: row.author_name, photo: fileUrl(req, row.author_photo) })
  const productRow = (req, r) => ({
    id: r.id, user_id: r.user_id, title: r.title, description: r.description, start_bid: r.start_bid,
    closed_at: r.closed_at, cover: fileUrl(req, r.cover), created_at: r.created_at, author: author(req, r),
  })
  const SELECT_PRODUCT = `SELECT p.*, u.name AS author_name, u.photo AS author_photo
    FROM products p JOIN users u ON u.id = p.user_id`

  // ---------- body ----------
  const readBody = (req, limit) => new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > limit) { reject(new HttpError(413, 'Ukuran data terlalu besar')); req.destroy(); return }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
  async function jsonBody(req) {
    const raw = await readBody(req, MAX_JSON)
    if (raw.length === 0) return {}
    try {
      const data = JSON.parse(raw.toString('utf8'))
      return data && typeof data === 'object' ? data : fail(400, 'Body harus berupa objek JSON')
    } catch (e) {
      return e instanceof HttpError ? fail(e.status, e.message) : fail(400, 'Body bukan JSON yang valid')
    }
  }
  async function imageUpload(req, field) {
    const parts = parseMultipart(await readBody(req, MAX_UPLOAD + 4096), req.headers['content-type'])
    const file = parts?.[field]
    if (!file || !file.filename) fail(400, `Field "${field}" wajib berupa file gambar`)
    if (file.data.length > MAX_UPLOAD) fail(413, 'Ukuran gambar maksimal 2 MB')
    const ext = detectImageExt(file.data)
    if (!ext) fail(400, 'File harus berupa gambar JPG, PNG, GIF, atau WEBP')
    const name = `${randomBytes(16).toString('hex')}.${ext}`
    writeFileSync(join(uploadDir, name), file.data)
    return name
  }

  // ---------- validasi ----------
  const text = (v, label, max) => {
    const s = typeof v === 'string' ? v.trim() : ''
    if (!s) fail(400, `${label} wajib diisi`)
    if (s.length > max) fail(400, `${label} maksimal ${max} karakter`)
    return s
  }
  const money = (v, label) => {
    const n = Number(v)
    if (!Number.isInteger(n) || n < 1 || n > 1e12) fail(400, `${label} harus berupa bilangan bulat lebih dari 0`)
    return n
  }
  const email = (v) => {
    const s = text(v, 'Email', 150).toLowerCase()
    if (!EMAIL.test(s)) fail(400, 'Format email tidak valid')
    return s
  }
  const password = (v, label = 'Kata sandi') => {
    if (typeof v !== 'string' || v.length < 6) fail(400, `${label} minimal 6 karakter`)
    if (v.length > 100) fail(400, `${label} maksimal 100 karakter`)
    return v
  }
  const productInput = (b) => {
    const closedAt = typeof b.closed_at === 'string' ? b.closed_at : ''
    if (!TIMESTAMP.test(closedAt) || Number.isNaN(Date.parse(closedAt.replace(' ', 'T') + 'Z'))) fail(400, 'Format "Dijual hingga" tidak valid')
    if (isClosed(closedAt)) fail(400, '"Dijual hingga" harus berupa waktu di masa depan')
    return {
      title: text(b.title, 'Nama barang', 150),
      description: text(b.description, 'Deskripsi', 10000),
      start_bid: money(b.start_bid, 'Harga'),
      closed_at: closedAt,
    }
  }

  // ---------- akses data ----------
  const findProduct = (id) => db.prepare(`${SELECT_PRODUCT} WHERE p.id = ?`).get(Number(id)) ?? fail(404, 'Barang tidak ditemukan')
  const ownedProduct = (id, user) => {
    const p = findProduct(id)
    if (p.user_id !== user.id) fail(403, 'Anda bukan pemilik barang ini')
    return p
  }
  const highest = (p) => db.prepare('SELECT MAX(bid) AS m FROM bids WHERE product_id = ?').get(p.id).m ?? 0

  // ---------- handlers ----------
  const ok = (message, data) => ({ status: 200, body: { status: 'success', message, ...(data && { data }) } })
  const routes = []
  const route = (method, pattern, auth, handler) =>
    routes.push({ method, regex: new RegExp(`^/api/v1${pattern}$`), auth, handler })

  route('POST', '/auth/register', false, async ({ req }) => {
    const b = await jsonBody(req)
    const name = text(b.name, 'Nama', 100), mail = email(b.email), pw = password(b.password)
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(mail)) fail(400, 'Email sudah terdaftar')
    db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, mail, hashPassword(pw))
    return ok('Pendaftaran berhasil, silakan masuk')
  })

  route('POST', '/auth/login', false, async ({ req }) => {
    const b = await jsonBody(req)
    const u = db.prepare('SELECT * FROM users WHERE email = ?').get(String(b.email ?? '').trim().toLowerCase())
    if (!u || typeof b.password !== 'string' || !checkPassword(b.password, u.password_hash)) fail(400, 'Email atau kata sandi salah')
    return ok('Login berhasil', { token: signToken(u.id, jwtSecret) })
  })

  route('POST', '/auth/logout', true, ({ auth }) => {
    db.prepare('INSERT OR IGNORE INTO revoked_tokens (jti) VALUES (?)').run(auth.jti)
    return ok('Logout berhasil')
  })

  route('GET', '/users', true, ({ req }) =>
    ok('Daftar pengguna', { users: db.prepare('SELECT * FROM users ORDER BY name').all().map((u) => publicUser(req, u)) }))
  route('GET', '/users/me', true, ({ req, user }) => ok('Profil pengguna', { user: publicUser(req, user) }))

  route('PUT', '/users/me', true, async ({ req, user }) => {
    const b = await jsonBody(req)
    const name = text(b.name, 'Nama', 100), mail = email(b.email)
    const taken = db.prepare('SELECT id FROM users WHERE email = ? AND id <> ?').get(mail, user.id)
    if (taken) fail(400, 'Email sudah dipakai pengguna lain')
    db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, mail, user.id)
    return ok('Profil berhasil diperbarui')
  })

  route('POST', '/users/me/photo', true, async ({ req, user }) => {
    const name = await imageUpload(req, 'photo')
    db.prepare('UPDATE users SET photo = ? WHERE id = ?').run(name, user.id)
    removeFile(user.photo)
    return ok('Foto profil berhasil diperbarui')
  })

  route('PUT', '/users/password', true, async ({ req, user }) => {
    const b = await jsonBody(req)
    if (typeof b.password !== 'string' || !checkPassword(b.password, user.password_hash)) fail(400, 'Kata sandi saat ini salah')
    const next = password(b.new_password, 'Kata sandi baru')
    if (next !== b.new_password_confirmation) fail(400, 'Konfirmasi kata sandi baru tidak cocok')
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(next), user.id)
    return ok('Kata sandi berhasil diubah')
  })

  route('GET', '/products', true, ({ req, user, query }) => {
    const where = [], args = []
    if (query.get('is_me') === '1') { where.push('p.user_id = ?'); args.push(user.id) }
    if (query.get('is_closed') === '1') { where.push('p.closed_at <= ?'); args.push(nowLocal()) }
    if (query.get('is_closed') === '0') { where.push('p.closed_at > ?'); args.push(nowLocal()) }
    const sql = `${SELECT_PRODUCT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY p.id DESC`
    return ok('Daftar barang', { products: db.prepare(sql).all(...args).map((r) => productRow(req, r)) })
  })

  route('POST', '/products', true, async ({ req, user }) => {
    const p = productInput(await jsonBody(req))
    const { lastInsertRowid } = db.prepare('INSERT INTO products (user_id, title, description, start_bid, closed_at) VALUES (?, ?, ?, ?, ?)')
      .run(user.id, p.title, p.description, p.start_bid, p.closed_at)
    return { status: 201, body: { status: 'success', message: 'Barang berhasil ditambahkan', data: { product_id: Number(lastInsertRowid) } } }
  })

  route('DELETE', '/products', true, ({ user }) => {
    const mine = db.prepare('SELECT cover FROM products WHERE user_id = ?').all(user.id)
    db.prepare('DELETE FROM products WHERE user_id = ?').run(user.id)
    mine.forEach((p) => removeFile(p.cover))
    return ok('Semua barang Anda berhasil dihapus')
  })

  route('GET', '/products/(\\d+)', true, ({ req, user, params }) => {
    const p = findProduct(params[0])
    const bids = db.prepare(`SELECT b.id, b.bid, b.created_at, b.user_id, u.name FROM bids b JOIN users u ON u.id = b.user_id
      WHERE b.product_id = ? ORDER BY b.bid DESC`).all(p.id)
    const mine = bids.find((b) => b.user_id === user.id)
    return ok('Detail barang', {
      product: {
        ...productRow(req, p),
        bids: bids.map((b) => ({ id: b.id, bid: b.bid, created_at: b.created_at, user: { id: b.user_id, name: b.name } })),
        my_bid: mine ? { id: mine.id, bid: mine.bid } : null,
      },
    })
  })

  route('PUT', '/products/(\\d+)', true, async ({ req, user, params }) => {
    const current = ownedProduct(params[0], user)
    const p = productInput(await jsonBody(req))
    db.prepare('UPDATE products SET title = ?, description = ?, start_bid = ?, closed_at = ? WHERE id = ?')
      .run(p.title, p.description, p.start_bid, p.closed_at, current.id)
    return ok('Barang berhasil diperbarui')
  })

  route('POST', '/products/(\\d+)/cover', true, async ({ req, user, params }) => {
    const current = ownedProduct(params[0], user)
    const name = await imageUpload(req, 'cover')
    db.prepare('UPDATE products SET cover = ? WHERE id = ?').run(name, current.id)
    removeFile(current.cover)
    return ok('Foto barang berhasil diperbarui')
  })

  route('DELETE', '/products/(\\d+)', true, ({ user, params }) => {
    const current = ownedProduct(params[0], user)
    db.prepare('DELETE FROM products WHERE id = ?').run(current.id)
    removeFile(current.cover)
    return ok('Barang berhasil dihapus')
  })

  route('POST', '/products/(\\d+)/bids', true, async ({ req, user, params }) => {
    const p = findProduct(params[0])
    const b = await jsonBody(req)
    if (p.user_id === user.id) fail(400, 'Anda tidak dapat menawar barang sendiri')
    if (isClosed(p.closed_at)) fail(400, 'Penjualan barang sudah ditutup')
    if (db.prepare('SELECT 1 FROM bids WHERE product_id = ? AND user_id = ?').get(p.id, user.id)) fail(400, 'Anda sudah mengajukan tawaran, batalkan dulu untuk menawar ulang')
    const amount = money(b.bid, 'Tawaran')
    const floor = Math.max(p.start_bid, highest(p))
    if (amount <= floor) fail(400, `Tawaran harus lebih tinggi dari ${floor}`)
    db.prepare('INSERT INTO bids (product_id, user_id, bid) VALUES (?, ?, ?)').run(p.id, user.id, amount)
    return { status: 201, body: { status: 'success', message: 'Tawaran berhasil dikirim' } }
  })

  route('DELETE', '/products/(\\d+)/bids', true, ({ user, params }) => {
    const p = findProduct(params[0])
    if (isClosed(p.closed_at)) fail(400, 'Penjualan barang sudah ditutup')
    const { changes } = db.prepare('DELETE FROM bids WHERE product_id = ? AND user_id = ?').run(p.id, user.id)
    if (!changes) fail(404, 'Anda belum mengajukan tawaran')
    return ok('Tawaran berhasil dibatalkan')
  })

  // ---------- server ----------
  function serveUpload(req, res, pathname) {
    const file = join(uploadDir, basename(pathname))
    const ext = extname(file).slice(1)
    if (!MIME[ext] || !existsSync(file)) return send(res, 404, { status: 'fail', message: 'File tidak ditemukan' })
    res.writeHead(200, { 'Content-Type': MIME[ext], 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff', 'Access-Control-Allow-Origin': corsOrigin, 'Cross-Origin-Resource-Policy': 'cross-origin' })
    return createReadStream(file).pipe(res)
  }
  const send = (res, status, body) => {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': corsOrigin,
      'X-Content-Type-Options': 'nosniff',
    })
    res.end(JSON.stringify(body))
  }

  function authenticate(req) {
    const token = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1]
    const payload = token && verifyToken(token, jwtSecret)
    if (!payload || db.prepare('SELECT 1 FROM revoked_tokens WHERE jti = ?').get(payload.jti)) return null
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub)
    return user ? { user, payload } : null
  }

  return async function handler(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost')
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization,Content-Type,Accept',
        })
        return res.end()
      }
      if (req.method === 'GET' && url.pathname.startsWith('/uploads/')) return serveUpload(req, res, url.pathname)
      const pathname = url.pathname.replace(/\/+$/, '') || '/'
      let pathMatched = false
      for (const r of routes) {
        const m = r.regex.exec(pathname)
        if (!m) continue
        pathMatched = true
        if (r.method !== req.method) continue
        const session = r.auth ? authenticate(req) : null
        if (r.auth && !session) fail(401, 'Token tidak valid atau sudah kedaluwarsa')
        const out = await r.handler({ req, params: m.slice(1), query: url.searchParams, user: session?.user, auth: session?.payload })
        return send(res, out.status, out.body)
      }
      return fail(pathMatched ? 405 : 404, pathMatched ? 'Metode tidak diizinkan' : 'Endpoint tidak ditemukan')
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { status: 'fail', message: err.message })
      console.error(err)
      return send(res, 500, { status: 'error', message: 'Terjadi kesalahan pada server' })
    }
  }
}
