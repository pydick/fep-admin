import Layout from "@/layout/index.vue";

export default {
  path: "/inno-fep",
  component: Layout,
  redirect: "/inno-fep/index",
  children: [
    {
      path: "/inno-fep/index",
      name: "Inno-FEP",
      component: () => import("@/views/inno-fep/pages/home/index.vue"),
      meta: {
        title: "Inno-FEP"
      }
    },
    {
      path: "/inno-fep/detail",
      name: "Inno-Fep-Detail",
      component: () => import("@/views/inno-fep/pages/detail/index.vue"),
      meta: {
        title: "Inno-Fep-detail",
        showLink: false
      }
    },
    {
      path: "/inno-fep/analysis-detail",
      name: "Inno-Fep-Analysis-Detail",
      component: () => import("@/views/inno-fep/pages/analysis-detail/index.vue"),
      meta: {
        title: "Inno-Fep-analysis-detail",
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
