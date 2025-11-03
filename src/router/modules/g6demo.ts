import Layout from "@/layout/index.vue";

export default {
  path: "/g6demo",
  component: Layout,
  redirect: "/g6demo/index",
  children: [
    {
      path: "/g6demo/index",
      name: "G6demo",
      component: () => import("@/views/g6demo/index.vue"),
      meta: {
        title: "g6demo",
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
