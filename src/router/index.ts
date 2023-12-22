import DashboardPage from "@/pages/DashboardPage.vue";
import { createRouter, createWebHistory } from "vue-router";
import authRoutes from "./auth";
import store from "store";
import jwt_decode from "jwt-decode";
import { DateTime } from "luxon";
import { Logger } from "@/logger/logger";

const logger = new Logger("stores-auth");

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
        requiresAuth: true,
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
        {
          path: "photon/:pid",
          name: "photon-success",
          component: () => import("@/pages/orders/PhotonSuccessPage.vue"),
        },
      ],
    },
    {
      path: "/faq",
      name: "faq",
      component: () => import("@/pages/FaqPage.vue"),
    },
    {
      path: "/launch",
      name: "launch",
      component: () => import("@/pages/auth/Launch.vue"),
    },
    {
      path: "/users",
      name: "users",
      meta: {
        requiresAuth: true,
        requiresRole: true,
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
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const user = store.get("currentUser");
    const b2cUser = store.get("currentb2cUser");
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if ((user && user.isLoggedIn) || (b2cUser && b2cUser.isLoggedIn)) {
      if (validateToken()) {
        if (to.matched.some((record) => record.meta.requiresRole)) {
          if (validateRole(user, b2cUser)) {
            next();
          }
          next({ name: "loginPage", query: { q: Date.now() } });
        } else {
          next();
        }
      } else {
        console.error("[Router] Token Invalid - Redirect to Login");
        logger.error("[Router] Token Invalid - Redirect to Login");
        next({ name: "loginPage", query: { q: Date.now() } });
      }
    } else {
      console.error("[Not logged in] Redirect to Login");
      logger.error("[Not logged in] Redirect to Login");
      next({ name: "loginPage", query: { q: Date.now() } });
    }
  } else {
    logger.log("[Require Auth Error] Does not require auth", to, from);
    next();
  }
});

const validateToken = () => {
  try {
    const token = store.get("token");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decodedToken: any = jwt_decode(token);
    const tokenExpireTime = DateTime.fromMillis(
      parseInt(decodedToken?.exp + "000", 10),
    );
    console.log(`Current time ${DateTime.local()}`);
    logger.log(`Current time ${DateTime.local()}`);
    console.log(`Token expiry time ${tokenExpireTime}`);
    logger.log(`Token expiry time ${tokenExpireTime}`);
    const diffInMinutes = tokenExpireTime.diff(DateTime.now(), [
      "minutes",
    ]).minutes;
    if (diffInMinutes > 0) {
      return true;
    }
  } catch (e) {
    console.error("[Invalid Token - Expection]: ", e);
    logger.error("[Invalid Token - Expection]: ", e);
    return false;
  }
  console.error("Invalid Token");
  logger.error("Invalid Token");
  return false;
};

const validateRole = (user, b2cUser) => {
  if (user && user.userType === "INT" && user.roleKey === "PMSuperAdminUser") {
    return true;
  }
  if (b2cUser.userType === "EXT" && b2cUser.roleKey === "PrinterAdmin") {
    return true;
  }
  return false;
};
export default router;
