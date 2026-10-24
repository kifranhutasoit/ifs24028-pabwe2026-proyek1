import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from './helpers/apiHelper.js'
import AuthLayout from './features/auth/layouts/AuthLayout.vue'
import LoginPage from './features/auth/pages/LoginPage.vue'
import RegisterPage from './features/auth/pages/RegisterPage.vue'
import ProductLayout from './features/products/layouts/ProductLayout.vue'
import HomePage from './features/products/pages/HomePage.vue'
import DetailPage from './features/products/pages/DetailPage.vue'
import UsersPage from './features/users/pages/UsersPage.vue'
import ProfilePage from './features/users/pages/ProfilePage.vue'
import LandingPage from './features/common/pages/LandingPage.vue'
import AdminLayout from './features/admin/layouts/AdminLayout.vue'
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage.vue'
import AdminUsersPage from './features/admin/pages/AdminUsersPage.vue'
import AdminProductsPage from './features/admin/pages/AdminProductsPage.vue'
import NotFoundPage from './features/common/pages/NotFoundPage.vue'

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
