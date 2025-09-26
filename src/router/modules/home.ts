import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/welcome",
  meta: {
    icon: "ep/home-filled",
    title: $t("menus.pureHome"),
    rank: 0
  },
  children: [
    {
      path: "/welcome",
      name: "Welcome",
      component: () => import("@/views/welcome/index.vue"),
      meta: {
        title: $t("menus.pureHome"),
        showLink: VITE_HIDE_HOME === "true" ? false : true
      }
    },
    {
      path: "/test",
      name: "test",
      component: () => import("@/views/test/index.vue"),
      meta: {
        title: "test"
      }
    },
    {
      path: "/g6demo",
      name: "g6demo",
      component: () => import("@/views/g6demo/index.vue"),
      meta: {
        title: "g6demo"
      }
    }
  ]
} satisfies RouteConfigsTable;
