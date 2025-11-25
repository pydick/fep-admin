<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ref, provide, reactive, inject, nextTick } from "vue";
import Protein3d from "@/views/inno-fep/components/Protein3d/index.vue";
import Ligand3d from "@/views/inno-fep/components/Ligand3d/index.vue";
import PerturbationGraph from "@/views/inno-fep/components/PerturbationGraph/index.vue";
import ProteinPreprocess from "./ProteinPreprocess/index.vue";
import LigandPreprocess from "./LigandPreprocess/index.vue";
import CalculationParameters from "./CalculationParameters/index.vue";
import CSstep from "@/components/CSstep/index.vue";
import { getLigandFromProtein } from "@/api/fep";
import { useTaskStoreHook } from "@/store/modules/task";
import { validateProtein, submitCalculateTask, submitAnalyzeTask, prepareLigand } from "@/api/fep";
import { ElLoading } from "element-plus";

const taskStore = useTaskStoreHook();

defineOptions({
  name: "CreateTask"
});
const stepList = ref<string[]>(["蛋白预处理", "配体预处理", "计算参数"]);
const activeStep = ref(1);
const protein3dRef = ref();

const emit = defineEmits<{
  (e: "recentResultJump"): void;
}>();
const stepRef = ref();

// 创建一个响应式对象来存储所有步骤的表单数据
interface TaskFormData {
  step1Form: any;
  step2Form: any;
  step3Form: any;
}

const taskFormData = reactive<TaskFormData>({
  step1Form: null,
  step2Form: null,
  step3Form: null
});

const perGraphPairList = ref([]);
const ligandStr = ref("[]");
const ligandData = ref({});
const proteinFileName = ref("");
const perGraphParams = ref({
  task_id: taskStore.taskId,
  step: 2,
  use_user_defined_map_flag: false,
  user_pair_list: []
});

const handleNext = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: "加载中",
    target: "#createTaskContainer"
  });
  try {
    const res = await prepareLigand(perGraphParams.value);
    if (res.success) {
      stepRef.value?.next();
      console.log(222, perturbationGraphRef.value?.getAllEdgeData());
      perGraphPairList.value =
        perturbationGraphRef.value?.getAllEdgeData().map(item => ({
          ligandPair: `${item.source} → ${item.target}`,
          similarity: item.data.mappingScore
        })) ?? [];
      console.log(222, perGraphPairList.value);
    } else {
      ElMessage.error(res.message);
    }
  } finally {
    loading.close();
  }
};

const handlePrev = () => {
  stepRef.value?.prev();
};
const perturbationGraphRef = ref();
const step2Disalbed = ref(true);

const handleSubmit = async () => {
  // 获取所有表单数据
  const step1Data = taskFormData.step1Form;
  const step2Data = taskFormData.step2Form;
  const step3Data = taskFormData.step3Form;

  console.log("提交任务", {
    step1: step1Data,
    step2: step2Data,
    step3: step3Data
  });
  const calculateParams = {
    task_id: taskStore.taskId,
    edges: perturbationGraphRef.value?.getAllEdgeData().map(item => `${item.source}_to_{item.target}`) ?? []
  };
  const calculateRes = await submitCalculateTask(calculateParams);
  if (calculateRes.success) {
    const analyzeParams = {
      task_id: taskStore.taskId,
      use_user_defined_map: false,
      monitor: false,
      poll_interval: 5,
      max_attempts: 60
    };
    const analyzeRes = await submitAnalyzeTask(analyzeParams);
    if (analyzeRes.success) {
      ElMessage.success("任务提交成功");
      emit("recentResultJump");
    } else {
      ElMessage.error(analyzeRes.message);
    }
  } else {
    ElMessage.error(calculateRes.message);
  }

  // TODO: 调用提交 API
  // await submitTask({ step1: step1Data, step2: step2Data, step3: step3Data });

  ElMessage.success("任务提交成功");
};

const handleCheckAndNext = async () => {
  // stepRef.value?.next();
  const loading = ElLoading.service({
    lock: true,
    text: "加载中",
    target: "#createTaskContainer"
  });
  try {
    const checkRes = await validateProtein({ task_id: taskStore.taskId });
    if (checkRes.success) {
      console.log(checkRes.data);
      const res = await getLigandFromProtein({ task_id: taskStore.taskId });
      if (res.success) {
        console.log(res.data);
        ligandData.value = res.data;
        stepRef.value?.next();
      } else {
        ElMessage.error(res.message);
      }
    } else {
      ElMessage.error(checkRes.message);
    }
  } finally {
    loading.close();
  }
};

// 提供任务表单数据和验证器
provide("protein3dRef", protein3dRef);
provide("taskFormData", taskFormData);
provide("ligandStr", ligandStr);
provide("ligandData", ligandData);
provide("perGraphParams", perGraphParams);
provide("proteinFileName", proteinFileName);
</script>

<template>
  <el-row id="createTaskContainer" :gutter="15" class="h-full flex-nowrap! overflow-auto">
    <el-col :span="12" :gutter="15" class="h-full min-width">
      <Protein3d v-if="activeStep === 1" ref="protein3dRef" class="h-full" />
      <Ligand3d v-if="activeStep === 2" ref="ligand3dRef" class="h-full" />
      <PerturbationGraph v-if="activeStep === 3" ref="perturbationGraphRef" :isEdit="false" class="h-full" />
    </el-col>
    <el-col :span="12" class="h-full min-width">
      <div class="h-full flex flex-col border border-[var(--el-card-border-color)] pt-[15px] pr-[15px] pb-[15px] pl-[15px]">
        <CSstep ref="stepRef" v-model:active="activeStep" class="max-w-full! pt-[15px] pb-[15px] bg-[var(--el-fill-color-light)]" :titleList="stepList" />
        <div class="flex-1 basis-0 overflow-y-auto">
          <ProteinPreprocess v-if="activeStep === 1" />
          <LigandPreprocess v-if="activeStep === 2" v-model:step2Disalbed="step2Disalbed" />
          <CalculationParameters v-if="activeStep === 3" :pairList="perGraphPairList" />
        </div>
        <div class="pt-[15px]">
          <el-button v-show="activeStep !== 1" @click="handlePrev">上一步</el-button>
          <el-button v-show="activeStep === 1" @click="handleCheckAndNext">检测并下一步</el-button>
          <el-button v-show="activeStep == 2" :disabled="step2Disalbed" @click="handleNext">下一步</el-button>
          <el-button v-show="activeStep === 3" type="primary" @click="handleSubmit">提交任务</el-button>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
<style lang="scss" scoped>
.min-width {
  /* prettier-ignore */
  min-width: 560PX;
}
</style>
