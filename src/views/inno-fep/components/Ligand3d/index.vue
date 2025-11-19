<script setup lang="ts">
import Ligand3d_molstar from "@/components/CSmolecule/Ligand3d/index.vue";
import { ref, inject, onMounted, watch } from "vue";
const ligandStr = inject<any>("ligandStr");
const ligandData = inject<any>("ligandData");
defineOptions({
  name: "Ligand3d"
});

const task_id = ref("15337");
</script>

<template>
  <div class="relative w-full h-full">
    <Ligand3d_molstar ref="ngl_ref" :smiles_id_list_str="ligandStr" :ligandData="ligandData" />
  </div>
</template>

<style lang="scss" scoped></style>
