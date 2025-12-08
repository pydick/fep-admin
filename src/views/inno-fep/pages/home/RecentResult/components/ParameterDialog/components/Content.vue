<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { getTaskParams } from "@/api/fep.js";
import { reactive, ref, defineProps, toRef, defineEmits, onMounted } from "vue";
import { ElMessage } from "element-plus";

defineOptions({
  name: "Content"
});

defineExpose({
  getTaskParamsData: (taskId: string) => getTaskParamsData(taskId)
});

const props = defineProps({});
const params_data = ref({
  task_name: "",
  protein_file_name: "",
  protein_prepare_params: {
    "Keep Chain": "",
    "Add Missing Residue": true,
    "Add Hydrogens": true,
    "Modify Protonation at pH": 7.4,
    "Optimize Hydrogen Bonding Network": true,
    "Energy Minimization Forcefield": ""
  },
  reference_ligand: "",
  perturbation_graph_type: "",
  center_molecules: "",
  ligand_pairs: [],
  simulation_params: {
    protein_force_field: "",
    force_field_file: "",
    simulation_time: ""
  }
});

const getTaskParamsData = async (taskId: string) => {
  const res = await getTaskParams(taskId);
  if (res.success) {
    params_data.value = res.data;
  } else {
    ElMessage.error(res.message);
  }
};
onMounted(() => {
  // getTaskParamsData();
});
</script>

<template>
  <div>
    <div style="max-height: 60vh; overflow-y: auto; padding-right: 10px">
      <div>
        <div>
          <span class="title">任务名称：</span>
          {{ params_data.task_name }}
        </div>
        <div>
          <span class="title">蛋白文件名称：</span>
          {{ params_data.protein_file_name || "-" }}
        </div>
        <div>
          <span class="title">蛋白预处理：</span>
        </div>
        <div class="table_box_column">
          <div class="table_item flex-1">
            <div class="table_title">Keep Chain</div>
            <div class="table_title">Add Missing Residue</div>
            <div class="table_title">Add Hydrogens</div>
            <div class="table_title">Modify Protonation at pH</div>
            <div class="table_title">Optimize Hydrogen Bonding Network</div>
            <div class="table_title">Energy Minimization Forcefield</div>
          </div>
          <div class="table_item flex-1">
            <div class="table_content">{{ params_data.protein_prepare_params["Keep Chain"] }}</div>
            <div class="table_content">{{ params_data.protein_prepare_params["Add Missing Residue"] }}</div>
            <div class="table_content">{{ params_data?.protein_prepare_params["Add Hydrogens"] }}</div>
            <div class="table_content">{{ params_data?.protein_prepare_params["Modify Protonation at pH"] }}</div>
            <div class="table_content">{{ params_data?.protein_prepare_params["Optimize Hydrogen Bonding Network"] }}</div>
            <div class="table_content">{{ params_data?.protein_prepare_params["Energy Minimization Forcefield"] }}</div>
          </div>
        </div>

        <div>
          <span class="title">分子叠合：</span>
        </div>
        <div class="table_box_column">
          <div class="table_item flex-1">
            <div class="table_title">参考配体</div>
          </div>
          <div class="table_item flex-1">
            <div class="table_content">{{ params_data.reference_ligand || "-" }}</div>
          </div>
        </div>

        <div>
          <span class="title">微扰图：</span>
        </div>
        <div class="table_box_column">
          <div class="table_item flex-1">
            <div class="table_title">微扰图方案</div>
            <div class="table_title">中心分子</div>
          </div>
          <div class="table_item flex-1">
            <div class="table_content">{{ params_data.perturbation_graph_type || "-" }}</div>
            <div class="table_content">{{ params_data.center_molecules || "-" }}</div>
          </div>
        </div>

        <div>
          <span class="title">用于计算的配体对：</span>
        </div>
        <div class="table_box_column">
          <div v-if="params_data.ligand_pairs.length > 0">
            <div v-for="(item, index) in params_data.ligand_pairs" :key="index">
              <div class="table_item flex-1">
                <div class="table_title">序号{{ index + 1 }}</div>
                <div class="table_content">Mapping score</div>
              </div>
              <div class="table_item flex-1">
                <div class="table_content">{{ item.ligand_pair }}</div>
                <div class="table_content">{{ item.similarity }}</div>
              </div>
            </div>
          </div>
          <div v-else class="table_item flex-1">
            <div class="text-center py-[10px]">暂无数据</div>
          </div>
        </div>

        <div>
          <span class="title">模拟参数：</span>
        </div>
        <div class="table_box_column">
          <div class="table_item flex-1">
            <div class="table_title">蛋白力场</div>
            <div class="table_title">配体力场</div>
            <div class="table_title">模拟时间</div>
          </div>
          <div class="table_item flex-1">
            <div class="table_content">{{ params_data.simulation_params.protein_force_field || "-" }}</div>
            <div class="table_content">{{ params_data.simulation_params.force_field_file || "-" }}</div>
            <div class="table_content">{{ params_data.simulation_params.simulation_time || "-" }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title {
  font-weight: bold;
}
.table_box {
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #ebeef5;
  margin: 10px 0;
  .table_item {
    flex: auto;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebeef5;
  }
  .table_title {
    white-space: nowrap;
    padding: 5px;
    font-weight: bold;
    border-bottom: 1px solid #ebeef5;
  }
  .table_content {
    white-space: nowrap;
    padding: 5px;
  }
}
.table_box_column {
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #ebeef5;
  margin: 10px 0;
  .table_item {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebeef5;
  }
  .table_title {
    white-space: nowrap;
    padding: 5px;
    font-weight: bold;
    border-bottom: 1px solid #ebeef5;
  }
  .table_content {
    white-space: nowrap;
    padding: 5px;
    border-bottom: 1px solid #ebeef5;
  }
}
</style>
