# Oper.in API

Backend buatan sendiri untuk Oper.in. Node.js murni tanpa dependensi (SQLite bawaan Node), jadi tidak perlu `npm install`.

## Menjalankan
Butuh **Node.js 22.5 atau lebih baru** (cek: `node -v`).

```bash
cd backend
copy .env.example .env      # Windows (Mac/Linux: cp .env.example .env)
# edit .env, isi JWT_SECRET dengan string acak yang panjang
npm run dev                 # http://localhost:5000/api/v1
npm test                    # menjalankan tes otomatis
```
Lalu di folder utama jalankan frontend seperti biasa: `npm run dev`. Vite akan meneruskan `/api` ke `http://localhost:5000`.

Data tersimpan di `backend/data/oper-in.db`, foto di `backend/uploads/`. Hapus keduanya untuk mulai dari nol.

## Endpoint (`/api/v1`, respons `{status, message, data}`)
| Metode | Path | Keterangan |
|---|---|---|
| POST | /auth/register, /auth/login, /auth/logout | daftar, masuk (mengembalikan `data.token`), keluar |
| GET | /users, /users/me | daftar pengguna, profil sendiri |
| PUT | /users/me, /users/password | ubah profil, ubah kata sandi |
| POST | /users/me/photo | unggah foto profil (field `photo`) |
| GET | /products?is_me=1&is_closed=0 | daftar barang, filter opsional |
| POST | /products | tambah barang `{title, description, start_bid, closed_at}` |
| GET / PUT / DELETE | /products/:id | detail (beserta `bids` dan `my_bid`), ubah, hapus (hanya pemilik) |
| DELETE | /products | hapus semua barang milik sendiri |
| POST | /products/:id/cover | unggah foto barang (field `cover`) |
| POST / DELETE | /products/:id/bids | kirim / batalkan tawaran |

Aturan tawaran: bukan pemilik barang, barang belum ditutup, satu tawaran per pengguna, nominal harus lebih tinggi dari harga dan tawaran tertinggi.

## Deploy
Backend ini memakai file SQLite, jadi butuh hosting dengan disk permanen (VPS, Railway, Render dengan disk). Vercel tidak cocok untuk backend ini. Isi `PUBLIC_URL` dengan domain API, lalu arahkan rewrite `/api` di `vercel.json` frontend ke domain tersebut.
