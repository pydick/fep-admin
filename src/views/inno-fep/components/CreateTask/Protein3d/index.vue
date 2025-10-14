<script setup lang="ts">
import Protein3d from "@/components/CSmolecule/Protein3d/index.vue";

import { ref } from "vue";
defineOptions({
  name: "Protein3d"
});

const protein3dRef = ref();

defineExpose({
  loadStructure: (...args) => protein3dRef.value?.loadStructure(...args),
  add_shape: (...args) => protein3dRef.value?.add_shape(...args),
  get_pdb_info: (...args) => protein3dRef.value?.get_pdb_info(...args),
  remove_shape: (...args) => protein3dRef.value?.remove_shape(...args)
  // ... 可以暴露更多需要的方法
});
</script>

<template>
  <Protein3d ref="protein3dRef" />
</template>

<style lang="scss" scoped />
