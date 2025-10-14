<script setup lang="ts">
import { data } from "./data.js";
import { inject } from "vue";
import CScard from "@/components/CScard/index.vue";
defineOptions({
  name: "ProteinPreprocess"
});
const protein3dRef = inject("protein3dRef");
const show_protein = () => {
  console.log("show_protein");
  protein3dRef.value.loadStructure(data, "pdb");
};
</script>

<template>
  <el-row class="flex-1">
    <el-button @click="show_protein">show_protein</el-button>
  </el-row>
</template>

<style lang="scss" scoped></style>
