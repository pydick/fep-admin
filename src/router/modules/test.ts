import Layout from "@/layout/index.vue";

export default {
  path: "/test",
  component: Layout,
  redirect: "/test/index",
  children: [
    {
      path: "/test/index",
      name: "Test",
      component: () => import("@/views/test/index.vue"),
      meta: {
        title: "test",
        showLink: true
      }
    }
  ]
} satisfies RouteConfigsTable;
