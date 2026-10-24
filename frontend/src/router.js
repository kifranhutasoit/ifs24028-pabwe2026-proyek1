import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from './helpers/apiHelper.js'

// Lazy load: tiap halaman hanya diunduh saat dibutuhkan
const AuthLayout = () => import('./features/auth/layouts/AuthLayout.vue')
const LoginPage = () => import('./features/auth/pages/LoginPage.vue')
const RegisterPage = () => import('./features/auth/pages/RegisterPage.vue')

const ProductLayout = () => import('./features/products/layouts/ProductLayout.vue')
const HomePage = () => import('./features/products/pages/HomePage.vue')
const DetailPage = () => import('./features/products/pages/DetailPage.vue')

const UsersPage = () => import('./features/users/pages/UsersPage.vue')
const ProfilePage = () => import('./features/users/pages/ProfilePage.vue')

const LandingPage = () => import('./features/common/pages/LandingPage.vue')
const NotFoundPage = () => import('./features/common/pages/NotFoundPage.vue')

const AdminLayout = () => import('./features/admin/layouts/AdminLayout.vue')
const AdminDashboardPage = () => import('./features/admin/pages/AdminDashboardPage.vue')
const AdminUsersPage = () => import('./features/admin/pages/AdminUsersPage.vue')
const AdminProductsPage = () => import('./features/admin/pages/AdminProductsPage.vue')

export const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    meta: { guest: true },
    children: [
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
    ],
  },
  {
    path: '/',
    component: ProductLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: HomePage },
      { path: 'products/:productId', component: DetailPage },
      { path: 'users', component: UsersPage },
      { path: 'profile', component: ProfilePage },
      {
        path: 'admin',
        component: AdminLayout,
        children: [
          { path: '', component: AdminDashboardPage },
          { path: 'users', component: AdminUsersPage },
          { path: 'products', component: AdminProductsPage },
        ],
      },
    ],
  },
  { path: '/welcome', component: LandingPage },
  { path: '/:pathMatch(.*)*', component: NotFoundPage },
]

function redirectFor(meta) {
  const loggedIn = Boolean(getAccessToken())
  if (meta.requiresAuth && !loggedIn) return '/auth/login'
  if (meta.guest && loggedIn) return '/'
  return ''
}

export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes })
  router.beforeEach((to) => redirectFor(to.meta) || true)
  return router
}