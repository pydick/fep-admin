<script setup lang="ts">
import FepHeader from "./Header/index.vue";
import CScard from "@/components/CScard/index.vue";
import CStab from "@/components/CStab/index.vue";
import CreateTask from "./CreateTask/index.vue";
import RecentResult from "./RecentResult/index.vue";
import { tabListEnum } from "@/views/inno-fep/const";
import { ref, reactive, onMounted } from "vue";
import { initTask } from "@/api/fep";
import { useTaskStoreHook } from "@/store/modules/task";

defineOptions({
  name: "Inno-Fep"
});

const taskStore = useTaskStoreHook();

const tabList = reactive<{ label: string; name: string }[]>(tabListEnum);
const activeName = ref(tabList[0].name);

onMounted(async () => {
  const res = await initTask();
  if (res.success) {
    taskStore.SET_TASK_ID(res.data.task_id);
  }
});
</script>

<template>
  <CScard body-class="flex-1 pt-0!" header-class="border-b-0! pt-0">
    <template #header>
      <FepHeader />
    </template>
    <template #content>
      <CStab v-model:activeName="activeName" :tabList="tabList">
        <template #createTask>
          <CreateTask v-if="activeName === tabListEnum[0].name" />
        </template>
        <template #recentResult>
          <RecentResult v-if="activeName === tabListEnum[1].name" v-model:activeName="activeName" />
        </template>
      </CStab>
    </template>
  </CScard>
</template>

<style lang="scss" scoped></style>
