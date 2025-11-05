<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ref, provide, reactive } from "vue";
import Protein3d from "@/views/inno-fep/components/Protein3d/index.vue";
import Ligand3d from "@/views/inno-fep/components/Ligand3d/index.vue";
import PerturbationGraph from "@/views/inno-fep/components/PerturbationGraph/index.vue";
import ProteinPreprocess from "./ProteinPreprocess/index.vue";
import LigandPreprocess from "./LigandPreprocess/index.vue";
import CalculationParameters from "./CalculationParameters/index.vue";
import CSstep from "@/components/CSstep/index.vue";

defineOptions({
  name: "CreateTask"
});
const stepList = ref<string[]>(["蛋白预处理", "配体预处理", "计算参数"]);
const activeStep = ref(1);
const protein3dRef = ref();

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

const handleNext = () => {
  stepRef.value?.next();
};

const handlePrev = () => {
  stepRef.value?.prev();
};

const handleSubmit = () => {
  // 获取所有表单数据
  const step1Data = taskFormData.step1Form;
  const step2Data = taskFormData.step2Form;
  const step3Data = taskFormData.step3Form;

  console.log("提交任务", {
    step1: step1Data,
    step2: step2Data,
    step3: step3Data
  });

  // TODO: 调用提交 API
  // await submitTask({ step1: step1Data, step2: step2Data, step3: step3Data });

  ElMessage.success("任务提交成功");
};

const graphType = ref("protein");
const handleCheckAndNext = () => {
  graphType.value = "ligand";
  stepRef.value?.next();
  console.log("检测并下一步");
};

// 提供任务表单数据和验证器
provide("protein3dRef", protein3dRef);
provide("taskFormData", taskFormData);
</script>

<template>
  <el-row id="createTaskContainer" :gutter="15" class="h-full flex-nowrap! overflow-auto">
    <el-col :span="12" :gutter="15" class="h-full min-width">
      <Protein3d v-if="activeStep === 1" ref="protein3dRef" class="h-full" />
      <Ligand3d v-if="activeStep === 2" ref="ligand3dRef" class="h-full" />
      <PerturbationGraph v-if="activeStep === 3" ref="PerturbationGraphRef" class="h-full" />
    </el-col>
    <el-col :span="12" class="h-full min-width">
      <div class="h-full flex flex-col border border-[var(--el-card-border-color)] pt-[15px] pr-[15px] pb-[15px] pl-[15px]">
        <CSstep ref="stepRef" v-model:active="activeStep" class="max-w-full! pt-[15px] pb-[15px] bg-[var(--el-fill-color-light)]" :titleList="stepList" />
        <div class="flex-1 basis-0 overflow-y-auto">
          <ProteinPreprocess v-if="activeStep === 1" />
          <LigandPreprocess v-if="activeStep === 2" />
          <CalculationParameters v-if="activeStep === 3" />
        </div>
        <div class="pt-[15px]">
          <el-button v-show="activeStep !== 1" @click="handlePrev">上一步</el-button>
          <el-button v-show="activeStep === 1" @click="handleCheckAndNext">检测并下一步</el-button>
          <el-button v-show="activeStep == 2" @click="handleNext">下一步</el-button>
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
