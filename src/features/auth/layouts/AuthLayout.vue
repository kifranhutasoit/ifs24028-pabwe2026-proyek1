<template>
  <main class="min-h-screen grid place-items-center p-4 bg-brand">
    <section class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl" aria-label="Autentikasi">
      <h1 class="text-2xl font-extrabold text-brand mb-1">Oper.in</h1>
      <p class="mb-6 text-sm text-stone-700">Platform Jual-Beli Barang Preloved IT Del</p>
      <RouterView />
      <RouterLink to="/welcome" class="mt-6 block text-sm font-semibold text-brand hover:underline">Kenali Oper.in lebih dekat</RouterLink>
    </section>
  </main>
</template>
