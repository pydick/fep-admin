<script setup lang="ts">
import Ligand3d_molstar from "@/components/CSmolecule/Ligand3d/index.vue";
import { ref, inject, onMounted, watch } from "vue";
const ligandStr = inject<any>("ligandStr");
defineOptions({
  name: "Ligand3d"
});

const task_id = ref("15337");

watch(ligandStr, newVal => {
  console.log(444, newVal);
});
</script>

<template>
  <div class="relative w-full h-full">
    <Ligand3d_molstar ref="ngl_ref" :job_id="task_id" :smiles_id_list_str="ligandStr" />
  </div>
</template>

<style lang="scss" scoped></style>
