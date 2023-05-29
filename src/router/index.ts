import DashboardPage from '@/pages/DashboardPage.vue'
import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from './auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    // ...orderRoutes,
    {
      path: '/',
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
