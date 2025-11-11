<script setup lang="ts">
import multi_ligand_dock_frame from "@drugflow/components/molecule/multi_ligand/multi_ligand_dock_frame.vue";
import { ref } from "vue";
import { data2 } from "./data2.js";
defineOptions({
  name: "Ligand3d"
});

const task_id = ref("15190");
const frame_data = ref(data2);
</script>

<template>
  <div class="relative w-full h-full">
    <multi_ligand_dock_frame ref="ngl_ref" :job_id="task_id" :smiles_id_list_str="JSON.stringify(frame_data)" />
  </div>
</template>

<style lang="scss" scoped></style>
