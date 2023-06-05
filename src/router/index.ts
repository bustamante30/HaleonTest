import DashboardPage from '@/pages/DashboardPage.vue'
import BasePage from '@/pages/BasePage.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/auth/Login.vue'
import B2clogin from '@/pages/auth/B2clogin.vue'
import LandingPage from '@/pages/auth/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ...orderRoutes,
    {
      path: '/',
      name: 'base',
      component: BasePage,
    },
    {
      path: '/b2clogin',
      name: 'b2clogin',
      component: B2clogin
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },{
      path: '/landing-page',
      name: 'landing-page',
      component: LandingPage
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
      children: [
        {
          path: ':id',
          name: 'order-detail',
          component: () => import('@/pages/orders/OrderDetailPage.vue'),
          children: [
          ]
        },
        {
          path: ':id/reorder',
          name: 'order-reorder',
          component: () => import('@/pages/orders/OrderReorderPage.vue'),
        },
        {
          path: ':id/confirm',
          name: 'order-confirm',
          component: () => import('@/pages/orders/ConfirmationPage.vue'),
        },
        {
          path: ':id/success',
          name: 'order-success',
          component: () => import('@/pages/orders/SuccessPage.vue'),
        }
      ]
    },
  ]
})

export default router
