import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/micro-fep",
    name: "Micro",
    component: () => import("@/views/micro-fep/index.vue"),
    meta: {
      title: "微前端",
      rank: 1,
      showLink: false
    }
  },
  {
    path: "/signin",
    name: "Signin",
    component: () => import("@/views/login/signin/index.vue"),
    meta: {
      title: $t("menus.pureLogin"),
      showLink: false,
      rank: 101
    }
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/views/login/signup/index.vue"),
    meta: {
      title: $t("menus.pureLogin"),
      showLink: false
      // rank: 101
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: $t("status.pureLoad"),
      showLink: false,
      rank: 102
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
