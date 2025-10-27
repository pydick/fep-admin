<script setup lang="ts">
import FepHeader from "./Header.vue";
import CScard from "@/components/CScard/index.vue";
import CStab from "@/components/CStab/index.vue";
import CreateTask from "./CreateTask/index.vue";
import RecentResult from "./RecentResult/index.vue";
import { ref } from "vue";
defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "Inno-Fep"
});
const tabList = ref<{ label: string; name: string }[]>([
  { label: "创建任务", name: "createTask" },
  { label: "最近结果", name: "recentResult" }
]);
const handleTabClick = (name: string) => {
  console.log(name);
};
</script>

<template>
  <CScard body-class="flex-1 pt-0!" header-class="border-b-0! pt-0">
    <template #header>
      <FepHeader />
    </template>
    <template #content>
      <CStab :tabList="tabList" @tabClcik="handleTabClick">
        <template #createTask>
          <CreateTask />
        </template>
        <template #recentResult>
          <RecentResult />
        </template>
      </CStab>
    </template>
  </CScard>
</template>

<style lang="scss" scoped></style>
