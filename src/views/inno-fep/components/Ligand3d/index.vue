<script setup lang="ts">
import Ligand3d_molstar from "@drugflow/components/molecule/ligand3d_molstar.vue";
import { ref, inject, onMounted } from "vue";
import { data2 } from "./data2.js";
const ligandStr = inject<any>("ligandStr");
defineOptions({
  name: "Ligand3d"
});

const task_id = ref("15190");
const frame_data = ref(data2);

onMounted(() => {
  console.log(ligandStr.value);
});
</script>

<template>
  <div class="relative w-full h-full">
    <Ligand3d_molstar ref="ngl_ref" :job_id="task_id" :smiles_id_list_str="JSON.stringify(frame_data)" />
  </div>
</template>

<style lang="scss" scoped></style>
