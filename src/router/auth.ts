export default [
  {
    path: "/",
    name: "base",
    component: () => import("@/pages/BasePage.vue"),
  },
  {
    path: "/b2clogin",
    name: "b2clogin",
    component: () => import("@/pages/auth/B2clogin.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/auth/Login.vue"),
  },
  {
    path: "/error",
    name: "loginerror",
    component: () => import("@/pages/auth/LoginError.vue"),
  },
];
