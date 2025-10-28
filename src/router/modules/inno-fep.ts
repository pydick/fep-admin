import Layout from "@/layout/index.vue";

export default {
  path: "/inno-fep",
  component: Layout,
  redirect: "/inno-fep/index",
  children: [
    {
      path: "/inno-fep/index",
      name: "Inno-Fep",
      component: () => import("@/views/inno-fep/index.vue"),
      meta: {
        title: "inno-fep"
      }
    },
    {
      path: "/inno-fep/detail",
      name: "Inno-Fep-Detail",
      component: () => import("@/views/inno-fep/detail.vue"),
      meta: {
        title: "inno-fep-detail",
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
