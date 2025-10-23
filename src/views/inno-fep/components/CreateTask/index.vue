<script setup lang="ts">
import Protein3d from "./Protein3d/index.vue";
import { ref, provide } from "vue";
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

const handleNext = () => {
  stepRef.value?.next();
};

const handlePrev = () => {
  stepRef.value?.prev();
};

const handleSubmit = () => {
  console.log("提交任务");
};
const handleCheckAndNext = () => {
  stepRef.value?.next();
  console.log("检测并下一步");
};
provide("protein3dRef", protein3dRef);
</script>

<template>
  <el-row class="h-full">
    <el-col :span="12" class="h-full pr-[10px]">
      <Protein3d ref="protein3dRef" class="h-full" />
    </el-col>
    <el-col :span="12" class="pl-[10px] h-full">
      <div class="h-full flex flex-col border border-[var(--el-card-border-color)] pt-[15px] pr-[20px] pb-[15px] pl-[20px]">
        <div class="pt-[15px] pb-[10px] bg-[var(--el-fill-color-light)]">
          <CSstep ref="stepRef" v-model:active="activeStep" class="max-w-full!" :titleList="stepList" />
        </div>
        <div class="flex-1 overflow-y-auto basis-0">
          <ProteinPreprocess v-show="activeStep === 1" />
          <LigandPreprocess v-show="activeStep === 2" />
          <CalculationParameters v-show="activeStep === 3" />
        </div>
        <div>
          <el-button v-show="activeStep !== 1" @click="handlePrev">上一步</el-button>
          <el-button v-show="activeStep === 1" @click="handleCheckAndNext">检测并下一步</el-button>
          <el-button v-show="activeStep == 2" @click="handleNext">下一步</el-button>
          <el-button v-show="activeStep === 3" @click="handleSubmit">提交任务</el-button>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
