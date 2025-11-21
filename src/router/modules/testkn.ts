import Layout from "@/layout/index.vue";

export default {
  path: "/testkn",
  component: Layout,
  redirect: "/testkn/index",
  children: [
    {
      path: "/testkn/index",
      name: "TestKN",
      component: () => import("@/views/testkn/index.vue"),
      meta: {
        title: "testkn"
      }
    }
  ]
} satisfies RouteConfigsTable;
