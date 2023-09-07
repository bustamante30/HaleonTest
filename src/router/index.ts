import DashboardPage from "@/pages/DashboardPage.vue";
import FaqPage from "@/pages/FaqPage.vue";
import HelpPage from "@/pages/HelpPage.vue";
import { createRouter, createWebHistory } from "vue-router";
import authRoutes from "./auth";
import store from "store";
import jwt_decode from 'jwt-decode'
import { DateTime } from 'luxon'

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
  console.log('Navigating from ', from)
  console.log('Navigating to',to)
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const user = store.get("currentUser")
    const b2cUser = store.get("currentb2cUser")
    console.log('checking user loggedin', user, b2cUser)
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if ((user && user.isLoggedIn) || (b2cUser && b2cUser.isLoggedIn)) {

      //validate token 
      if(validateToken()){
        console.log("Go to Routes")
        next() 
      }else{
        console.log('Token Invalid - Redirect to Login')
          next({name: 'loginPage', query: { q: Date.now() }})
      }

    } else {
      console.log('Redirect to Login')
      next({name: 'loginPage', query: { q: Date.now() }})
    }
  } else {
    console.log('Does not require auth',to, from)
    next() // does not require auth, make sure to always call next()!
  }
})


const validateToken = () =>{
  try{
  const token = store.get("token")
  const decodedToken : any =  jwt_decode(token)
  const tokenExpireTime = DateTime.fromMillis(parseInt(decodedToken?.exp+'000',10) )
  console.log(`Current time ${DateTime.local()}`)
  console.log(`${tokenExpireTime}`)
  const  diffInMinutes = tokenExpireTime.diff(DateTime.now(), ["minutes"]).minutes
  if(diffInMinutes > 0){
    console.log('Valid Token')
    return true
  }

  }catch(e){
    console.log('Invalid Token - Expection ',e )
    return false
  }
  console.log('Invalid Token')
  return false
}
export default router;
