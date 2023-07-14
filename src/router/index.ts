import DashboardPage from "@/pages/DashboardPage.vue";
import { createRouter, createWebHistory } from "vue-router";
import authRoutes from "./auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    {
      path: "/dashboard",
      name: "dashboard",
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
      path: "/users",
      name: "users",
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

export default router;
