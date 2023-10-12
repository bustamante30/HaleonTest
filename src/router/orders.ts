export default [
  {
    path: "/orders",
    name: "orders",
    component: () => import("@/pages/orders/index.vue"),
    children: [
      {
        path: ":id",
        name: "order-detail",
        component: () => import("@/pages/orders/OrderDetailPage.vue"),
        children: [
          {
            path: "reorder",
            name: "order-reorder",
            component: () => import("@/pages/orders/OrderReorderPage.vue"),
          },
          {
            path: "confirm",
            name: "order-confirm",
            component: () => import("@/pages/orders/ConfirmationPage.vue"),
          },
          {
            path: "success",
            name: "order-success",
            component: () => import("@/pages/orders/SuccessPage.vue"),
          },
        ],
      },
    ],
  },
];
