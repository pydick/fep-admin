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
import { storageLocal } from "@/store/utils";
import { taskIdKey } from "@/store/modules/task";
import { ElMessage, ElLoading } from "element-plus";

defineOptions({
  name: "Inno-FEP"
});

const taskStore = useTaskStoreHook();

const tabList = reactive<{ label: string; name: string }[]>(tabListEnum);
const activeName = ref(tabList[0].name);

const recentResultJump = () => {
  activeName.value = tabListEnum[1].name;
};

onMounted(async () => {
  const loading = ElLoading.service({
    text: "任务加载中",
    target: "#fepTab"
  });
  try {
    const res = await initTask();
    if (res.success) {
      taskStore.SET_TASK_ID(res.data.task_id);
    } else {
      ElMessage.error(res.message);
      storageLocal().removeItem(taskIdKey);
    }
  } finally {
    loading.close();
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
          <div id="fepTab" class="h-full">
            <CreateTask v-if="activeName === tabListEnum[0].name" @recentResultJump="recentResultJump" />
          </div>
        </template>
        <template #recentResult>
          <RecentResult v-if="activeName === tabListEnum[1].name" v-model:activeName="activeName" />
        </template>
      </CStab>
    </template>
  </CScard>
</template>

<style lang="scss" scoped></style>
