
export default [
  {
    path: "/",
    name: "base",
    component: () => import('@/pages/BasePage.vue'),
  },
  {
    path: "/water",
    name: "water",
    component: () => import('@/pages/WaterFront.vue'),
  },
  {
    path: "/b2clogin",
    name: "b2clogin",
    component: () => import('@/pages/auth/B2clogin.vue'),
  },
  {
    path: "/login",
    name: "login",
    component: () => import('@/pages/auth/Login.vue'),
  }
];
