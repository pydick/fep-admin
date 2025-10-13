<script setup lang="ts">
import Protein3d from "./Protein3d/index.vue";
import CStab from "@/components/CStab/index.vue";
import { ref } from "vue";
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
</script>

<template>
  <el-row :gutter="10">
    <el-col :span="12">
      <Protein3d />
    </el-col>
    <el-col :span="12">
      <CStab :tabList="tabList">
        <template #proteinPreprocess><ProteinPreprocess /></template>
        <template #ligandPreprocess><LigandPreprocess /></template>
        <template #calculationParameters><CalculationParameters /></template>
      </CStab>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped></style>
