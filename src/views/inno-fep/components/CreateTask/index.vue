<script setup lang="ts">
import Protein3d from "./Protein3d/index.vue";
import CStab from "@/components/CStab/index.vue";
import { ref, provide } from "vue";
import ProteinPreprocess from "./ProteinPreprocess/index.vue";
import LigandPreprocess from "./LigandPreprocess/index.vue";
import CalculationParameters from "./CalculationParameters/index.vue";

defineOptions({
  name: "CreateTask"
});
const tabList = ref<{ label: string; name: string }[]>([
  { label: "蛋白预处理", name: "proteinPreprocess" },
  { label: "配体预处理", name: "ligandPreprocess" },
  { label: "计算参数", name: "calculationParameters" }
]);
const protein3dRef = ref();
provide("protein3dRef", protein3dRef);
</script>

<template>
  <el-row :gutter="10" class="h-full">
    <el-col :span="12" class="h-full">
      <Protein3d ref="protein3dRef" />
    </el-col>
    <el-col :span="12" class="h-full">
      <CStab :tabList="tabList">
        <template #proteinPreprocess><ProteinPreprocess /></template>
        <template #ligandPreprocess><LigandPreprocess /></template>
        <template #calculationParameters><CalculationParameters /></template>
      </CStab>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped></style>
