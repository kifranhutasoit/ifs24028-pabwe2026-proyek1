# Oper.in

Platform Jual-Beli Barang Preloved IT Del.

```
oper-in/
├── backend/    API (Node.js 22.5+, SQLite bawaan, tanpa dependensi)
└── frontend/   Aplikasi web (Vue 3 + Pinia + Tailwind)
```

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
