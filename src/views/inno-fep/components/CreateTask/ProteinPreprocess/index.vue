<script setup lang="ts">
import { data } from "./data.js";
import { inject } from "vue";
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
  <div>
    <el-button @click="show_protein">show_protein</el-button>
  </div>
</template>

<style lang="scss" scoped></style>

<style lang="scss" scoped></style>
