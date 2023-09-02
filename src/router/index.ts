import DashboardPage from "@/pages/DashboardPage.vue";
import FaqPage from "@/pages/FaqPage.vue";
import HelpPage from "@/pages/HelpPage.vue";
import { createRouter, createWebHistory } from "vue-router";
import authRoutes from "./auth";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    {
      path: "/",
      name: "loginPage",
      component: () => import("@/pages/BasePage.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      meta: {
        requiresAuth: true
      },
      component: DashboardPage,
      children: [
        {
          path: "/cart",
          name: "cart",
          component: () => import("@/pages/cart/index.vue"),
        },
        {
          path: ":id",
          name: "order-detail",
          component: () => import("@/pages/orders/OrderDetailPage.vue"),
        },
        {
          path: ":id/reorder",
          name: "order-reorder",
          component: () => import("@/pages/orders/OrderReorderPage.vue"),
        },
        {
          path: ":id/confirm",
          name: "order-confirm",
          component: () => import("@/pages/orders/ConfirmationPage.vue"),
        },
        {
          path: ":id/success",
          name: "order-success",
          component: () => import("@/pages/orders/SuccessPage.vue"),
        },
      ],
    },
     {
      path: '/faq',
      name: 'faq',
      component: FaqPage
    },
    {
      path: '/help',
      name: 'help',
      component: HelpPage
    },
    {
      path: "/users",
      name: "users",
      meta: {
        requiresAuth: true
      },
      component: () => import("@/pages/users/index.vue"),
      children: [
        {
          path: ":id",
          name: "user-edit",
          component: () => import("@/pages/users/UserEditPage.vue"),
        },
        {
          path: "new",
          name: "user-create",
          component: () => import("@/pages/users/UserCreatePage.vue"),
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const authStore = useAuthStore();
    const authb2cStore = useB2CAuthStore();
    const isb2cUserLoggedIn = computed(() => authb2cStore.currentB2CUser.isLoggedIn);
    const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (isUserLoggedIn.value ||  isb2cUserLoggedIn.value) {
      next() // go to wherever I'm going
    } else {
      next({ name: 'loginPage' })
    }
  } else {
    next() // does not require auth, make sure to always call next()!
  }
})
export default router;
