# Oper.in

Platform Jual-Beli Barang Preloved IT Del.

```
oper-in/
├── backend/    API (Node.js 22.5+, SQLite bawaan, tanpa dependensi)
└── frontend/   Aplikasi web (Vue 3 + Pinia + Tailwind)
```

## Fitur
- **Halaman depan** (`/welcome`): pengenalan platform, kategori, cara kerja.
- **Pengguna**: daftar/masuk, jual barang (dengan kategori dan foto), cari dan filter kategori, tawar dan batalkan tawaran, profil dan foto profil.
- **Admin** (`/admin`): ringkasan statistik, kelola pengguna (jadikan admin, nonaktifkan, hapus), hapus barang siapa pun.

Akun admin dibuat otomatis dari `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di `backend/.env` saat backend dijalankan. Akun yang sudah ada dengan email itu akan dinaikkan menjadi admin.

## Menjalankan (butuh dua terminal)

**Terminal 1: backend** (http://localhost:5000/api/v1)
```bash
cd backend
copy .env.example .env     # Mac/Linux: cp .env.example .env
npm run dev
```

**Terminal 2: frontend** (http://localhost:3000)
```bash
cd frontend
npm install
npm run dev
```
Vite meneruskan `/api` ke `http://localhost:5000`. Daftar akun baru lalu masuk.

## Tes
```bash
cd backend  && npm test
cd frontend && npm test
```

Detail endpoint dan deploy ada di `backend/README.md`.
