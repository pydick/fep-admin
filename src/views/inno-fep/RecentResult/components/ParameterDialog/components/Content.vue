<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { refresh_task } from "@/api/fep.js";
import { reactive, ref, defineProps, toRef, defineEmits, onMounted } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "Content"
});

const props = defineProps({
  options: Object
});
const options = ref(props.options);
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const params_data = ref();

const form = ref({
  newTeam: [
    {
      name: "",
      quantity: "",
      user_type: "",
      license_time: ""
    }
  ]
});

const get_date = () => {
  refresh_task().then(res => {
    params_data.value = res;
  });
};
onMounted(() => {
  get_date();
});
</script>

<template>
  <div>
    <div style="max-height: 60vh; overflow-y: auto; padding-right: 10px">
      <div v-if="options.data.type == 'docking'">
        <div>
          <span class="title">任务名称：</span>
          {{ params_data?.others.name }}
        </div>
        <div>
          <span class="title">蛋白文件名称：</span>
          {{ params_data?.pdb_name }}
        </div>
        <div>
          <span class="title">蛋白预处理：</span>
        </div>
        <div class="table_box_column">
          <div class="table_item">
            <div class="table_title">Keep Chain</div>
            <div class="table_title">Add Missing Residue</div>
            <div class="table_title">Add Hydrogens</div>
            <div class="table_title">Modify Protonation at pH</div>
            <div class="table_title">Optimize Hydrogen Bonding Network</div>
            <div class="table_title">Energy Minimization Forcefield</div>
          </div>
          <div class="table_item" style="flex: 1">
            <div class="table_content">{{ params_data?.protein.chain.join(",") }}</div>
            <div class="table_content">{{ params_data?.protein.add_missing_residue }}</div>
            <div class="table_content">{{ params_data?.protein.addh }}</div>
            <div class="table_content">{{ params_data?.protein.ph }}</div>
            <div class="table_content">{{ params_data?.protein.opt_hydrogen }}</div>
            <div class="table_content">{{ params_data?.protein.force_field }}</div>
          </div>
        </div>
        <div>
          <span class="title">配体文件名称：</span>
          {{ params_data?.others.ligands_name }}
        </div>
        <div>
          <span class="title">SMILES列：</span>
          {{ params_data?.others.smiles_col }}
        </div>
        <div>
          <span class="title">配体预处理：</span>
        </div>
        <div class="table_box_column">
          <div class="table_item">
            <div class="table_title">Disconnect Group (Metal Ion/salt Ion)</div>
            <div class="table_title">Only Largest Molecular Fragment</div>
            <div class="table_title">Ionization</div>
            <div class="table_title">Tautomers</div>
            <div class="table_title">Stereoisomers</div>
            <div v-if="params_data?.ligands.is_isomer" class="table_title">Isomers Limit</div>
            <div class="table_title">Forcefield</div>
          </div>
          <div class="table_item" style="flex: 1">
            <div class="table_content">{{ params_data?.ligands.disconnect_group }}</div>
            <div class="table_content">{{ params_data?.ligands.keep_large_fragment }}</div>
            <div class="table_content">
              {{ params_data?.ligands.protonation == "keep" ? "Keep Original State" : params_data?.ligands.protonation }}
              <span v-if="params_data?.ligands.protonation == 'set_pH'">{{ params_data?.ligands.min_ph + "-" + params_data?.ligands.max_ph }}</span>
            </div>
            <div class="table_content">{{ params_data?.ligands.tautomers }}</div>
            <div class="table_content">{{ params_data?.ligands.stereoisomers == "keep" ? "Keep Original Structure" : params_data?.ligands.stereoisomers }}</div>
            <div v-if="params_data?.ligands.is_isomer" class="table_content">{{ params_data?.ligands.isomer_limit }}</div>
            <div class="table_content">{{ params_data?.ligands.molecule_minimize }}</div>
          </div>
        </div>
        <div>
          <span class="title">对接方法：</span>
          {{ params_data?.docking.scoring_function }}
        </div>
        <div>
          <span class="title">Docking Site：</span>
          {{ params_data?.docking.site }}
        </div>
        <div class="table_box">
          <div class="table_item">
            <div class="table_title">X</div>
            <div class="table_content">{{ Math.round(params_data?.docking.center[0] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Y</div>
            <div class="table_content">{{ Math.round(params_data?.docking.center[1] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Z</div>
            <div class="table_content">{{ Math.round(params_data?.docking.center[2] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Length</div>
            <div class="table_content">{{ Math.round(params_data?.docking.size[0] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Width</div>
            <div class="table_content">{{ Math.round(params_data?.docking.size[1] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Height</div>
            <div class="table_content">{{ Math.round(params_data?.docking.size[2] * 1000) / 1000 }}</div>
          </div>
        </div>
        <div>
          <span class="title">Docking Mode：</span>
          {{ params_data?.docking.flexible == "semi" ? "Semi flexible" : params_data?.docking.flexible }}
        </div>
        <div>
          <span class="title">Output Pose：</span>
          {{ params_data?.docking.num_poses }}
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
