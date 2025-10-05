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
    }
  ]
} satisfies RouteConfigsTable;
