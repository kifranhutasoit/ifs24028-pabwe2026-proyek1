<script setup>
import { Laptop, BookOpen, Shirt, Armchair, PencilRuler, Package, UserPlus, Camera, Handshake, ShieldCheck, HandCoins, Users } from 'lucide-vue-next'
import { CATEGORIES } from '../../products/categories.js'

const categoryIcons = { Elektronik: Laptop, Buku: BookOpen, Pakaian: Shirt, Perabot: Armchair, 'Alat Tulis': PencilRuler, Lainnya: Package }
const steps = [
  { icon: UserPlus, title: 'Daftar gratis', text: 'Buat akun dengan email kampus atau email pribadi dalam hitungan detik.' },
  { icon: Camera, title: 'Pasang barang', text: 'Unggah foto, tulis deskripsi, tentukan harga dan batas waktu penjualan.' },
  { icon: Handshake, title: 'Tawar dan sepakati', text: 'Pembeli mengajukan tawaran, penjual memilih yang terbaik.' },
]
const benefits = [
  { icon: HandCoins, title: 'Harga bersahabat', text: 'Barang bekas berkualitas dengan harga ramah kantong mahasiswa.' },
  { icon: Users, title: 'Sesama warga IT Del', text: 'Transaksi dengan teman satu kampus, lebih mudah dan lebih tenang.' },
  { icon: ShieldCheck, title: 'Dimoderasi admin', text: 'Admin menjaga marketplace tetap rapi dan aman dari penyalahgunaan.' },
]
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-30 bg-brand text-white shadow-md">
      <nav class="mx-auto flex max-w-6xl items-center gap-3 p-3" aria-label="Navigasi landing">
        <RouterLink to="/welcome" class="mr-auto flex items-center gap-2 text-lg font-extrabold">
          <img src="/logo.svg" alt="" class="h-8 w-8 rounded-lg" /><span>Oper.in</span>
        </RouterLink>
        <RouterLink to="/auth/login" class="rounded-lg px-3 py-2 font-semibold transition hover:bg-white/10">Masuk</RouterLink>
        <RouterLink to="/auth/register" class="rounded-lg bg-white px-4 py-2 font-bold text-brand transition hover:bg-stone-100">Daftar</RouterLink>
      </nav>
    </header>

    <section aria-label="Pengantar" class="bg-gradient-to-br from-brand via-brand to-[#1d7a8f] text-white">
      <div class="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-2 md:items-center">
        <div class="space-y-6">
          <p class="inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">Platform Jual-Beli Barang Preloved IT Del</p>
          <h1 class="text-4xl font-extrabold leading-tight md:text-5xl">Barang bekas, <span class="text-amber-300">cerita baru.</span></h1>
          <p class="max-w-prose text-lg text-white/90">Jual barang yang tidak terpakai, temukan barang bagus dengan harga hemat, semuanya dari sesama warga IT Del.</p>
          <div class="flex flex-wrap gap-3">
            <RouterLink to="/" class="rounded-xl bg-accent px-6 py-3 font-bold text-white shadow-lg transition hover:brightness-110">Mulai jual-beli</RouterLink>
            <RouterLink to="/auth/register" class="rounded-xl border border-white/60 px-6 py-3 font-bold transition hover:bg-white/10">Daftar gratis</RouterLink>
          </div>
        </div>
        <div aria-hidden="true" class="hidden justify-center md:flex">
          <div class="grid grid-cols-3 gap-4">
            <span v-for="c in CATEGORIES" :key="c" class="grid h-24 w-24 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <component :is="categoryIcons[c]" :size="40" :stroke-width="1.5" />
            </span>
          </div>
        </div>
      </div>
    </section>

    <section aria-label="Kategori" class="mx-auto max-w-6xl px-4 py-14">
      <h2 class="mb-6 text-2xl font-extrabold text-brand">Jelajahi kategori</h2>
      <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <li v-for="c in CATEGORIES" :key="c" class="flex flex-col items-center gap-3 rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-lg">
          <span class="grid h-14 w-14 place-items-center rounded-xl bg-brand/10 text-brand"><component :is="categoryIcons[c]" :size="28" aria-hidden="true" /></span>
          <span class="font-bold">{{ c }}</span>
        </li>
      </ul>
    </section>

    <section aria-label="Cara kerja" class="bg-white py-14">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="mb-8 text-2xl font-extrabold text-brand">Cara kerja</h2>
        <ol class="grid gap-6 md:grid-cols-3">
          <li v-for="(s, i) in steps" :key="s.title" class="space-y-3 rounded-2xl bg-stone-50 p-6">
            <span class="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white"><component :is="s.icon" :size="24" aria-hidden="true" /></span>
            <h3 class="text-lg font-bold">{{ i + 1 }}. {{ s.title }}</h3>
            <p class="text-stone-700">{{ s.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section aria-label="Keunggulan" class="mx-auto max-w-6xl px-4 py-14">
      <h2 class="mb-8 text-2xl font-extrabold text-brand">Kenapa Oper.in</h2>
      <ul class="grid gap-6 md:grid-cols-3">
        <li v-for="b in benefits" :key="b.title" class="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <component :is="b.icon" :size="28" class="text-accent" aria-hidden="true" />
          <h3 class="text-lg font-bold">{{ b.title }}</h3>
          <p class="text-stone-700">{{ b.text }}</p>
        </li>
      </ul>
    </section>

    <section aria-label="Ajakan" class="bg-brand py-12 text-center text-white">
      <h2 class="text-2xl font-extrabold">Siap melepas barang lamamu?</h2>
      <RouterLink to="/auth/register" class="mt-5 inline-block rounded-xl bg-white px-6 py-3 font-bold text-brand transition hover:bg-stone-100">Buat akun sekarang</RouterLink>
    </section>
    <footer class="p-6 text-center text-sm text-stone-700">Oper.in · Platform Jual-Beli Barang Preloved IT Del</footer>
  </div>
</template>
