import { createServer } from 'node:http'
import { resolve } from 'node:path'
import { openDb } from './db.js'
import { createApp } from './app.js'

try { process.loadEnvFile('.env') } catch { /* .env opsional */ }

const env = process.env
const jwtSecret = env.JWT_SECRET || 'dev-secret-jangan-dipakai-di-produksi'
if (!env.JWT_SECRET) console.warn('PERINGATAN: JWT_SECRET belum diatur di .env, memakai secret bawaan (hanya untuk pengembangan).')

const db = openDb(resolve(env.DB_FILE || './data/oper-in.db'))
const handler = createApp({
  db,
  uploadDir: resolve(env.UPLOAD_DIR || './uploads'),
  jwtSecret,
  publicUrl: env.PUBLIC_URL || '',
  timeZone: env.APP_TZ || 'Asia/Jakarta',
  corsOrigin: env.CORS_ORIGIN || '*',
})

const port = Number(env.PORT || 5000)
createServer(handler).listen(port, () => console.log(`Oper.in API berjalan di http://localhost:${port}/api/v1`))
