<template>
  <div class="prolif_frame" :style="{ width: props.width, height: props.height }">
    <div ref="prolif" class="prolif_iframe" />
    <div class="prolif_btn">
      <el-radio-group v-model="ligand" @change="set_ligand">
        <div v-for="item in props.pdb_ligand_inter_list" :key="item">
          <div v-for="it in item.ligand_list" :key="it">
            <el-radio :label="item.pdb_name + ':' + it.auth_asym_id + ':' + it.residue_name + ':' + it.auth_residue_number" size="small">
              <span v-if="props.show_ligname">
                <span v-if="item.pdb_name === 'ref'">{{ t("result.参考配体") }}: {{ it.auth_asym_id }}: {{ it.residue_name }}: {{ it.auth_residue_number }}</span>
                <span v-else>{{ item.pdb_name }}: {{ it.auth_asym_id }}: {{ it.residue_name }}: {{ it.auth_residue_number }}</span>
              </span>
              <span v-else>
                <span v-if="item.pdb_name === 'ref'">{{ t("result.参考配体") }}</span>
                <span v-else>{{ item.pdb_name }}</span>
              </span>
            </el-radio>
          </div>
        </div>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { get_interaction_iframe_api } from "@/api/molecular.js";
import { useI18n } from "vue-i18n";

const props = defineProps({
  width: {
    type: String,
    default: "100%"
  },
  height: {
    type: String,
    default: "590px"
  },
  lig_name: {
    type: String,
    default: "A:UNL"
  },
  pdb_ligand_inter_list: {
    type: Array,
    default: () => [
      {
        pdb_string: "",
        pdb_name: "ref",
        ligand_list: [
          { auth_asym_id: "A", residue_name: "UNL" },
          { auth_asym_id: "A", residue_name: "3QS" }
        ]
      },
      {
        pdb_string: "",
        pdb_name: "1-1",
        ligand_list: [
          { auth_asym_id: "B", residue_name: "UNL" },
          { auth_asym_id: "B", residue_name: "3QS" }
        ]
      }
    ]
  },
  show_ligname: {
    type: Boolean,
    default: true
  }
});
const { t } = useI18n();
const prolif = ref(null);
const first_render = ref(true);
const ligand = ref(props.pdb_ligand_inter_list[0].pdb_name + ":" + props.pdb_ligand_inter_list[0].ligand_list[0].auth_asym_id + ":" + props.pdb_ligand_inter_list[0].ligand_list[0].residue_name + ":" + props.pdb_ligand_inter_list[0].ligand_list[0].auth_residue_number);

const set_ligand = async () => {
  first_render.value = false;
  open_loading("Loading...");
  console.log("set_ligand", ligand.value);
  let pdb_string = "";
  let residue_full_info = [];
  for (let i = 0; i < props.pdb_ligand_inter_list.length; i++) {
    for (let j = 0; j < props.pdb_ligand_inter_list[i].ligand_list.length; j++) {
      if (ligand.value === props.pdb_ligand_inter_list[i].pdb_name + ":" + props.pdb_ligand_inter_list[i].ligand_list[j].auth_asym_id + ":" + props.pdb_ligand_inter_list[i].ligand_list[j].residue_name + ":" + props.pdb_ligand_inter_list[i].ligand_list[j].auth_residue_number) {
        pdb_string = props.pdb_ligand_inter_list[i].pdb_string;
        if (props.pdb_ligand_inter_list[i].residue_full_info) {
          residue_full_info = props.pdb_ligand_inter_list[i].residue_full_info;
        }
      }
    }
  }
  const form = new FormData();
  // console.log(pdb_string)
  const pdb_file = new File([pdb_string], "pdb.pdb");
  form.append("pdb", pdb_file);
  form.append(
    "args",
    JSON.stringify({
      chain_id: ligand.value.split(":")[1],
      ligand_name: ligand.value.split(":")[2],
      ligand_residue_number: ligand.value.split(":")[3],
      info_calculated: residue_full_info
    })
  );
  const res = await get_interaction_iframe_api(form);
  if (res.status === false || !res.iframe_string[0].iframe) {
    prolif.value.innerHTML = '<p style="font-size: 1.5rem; padding: 6rem 0; margin: 0 auto; width: 10rem;">No Interaction</p>';
  } else {
    prolif.value.innerHTML = res.iframe_string[0].iframe;
  }
  // res.data.iframe_string = res.data.iframe_string.replace('height="590px"', 'height=' + props.height)

  close_loading();
};

onMounted(async () => {
  await set_ligand();
});

// watch(() => props.pdb_ligand_inter_list, (newValue, oldValue) => {
//   console.log('pdb_ligand_inter_list changed!')
//   const final_index = props.pdb_ligand_inter_list.length - 1
//   ligand.value = props.pdb_ligand_inter_list[final_index].pdb_name + ':' + props.pdb_ligand_inter_list[final_index].ligand_list[0].auth_asym_id + ':' + props.pdb_ligand_inter_list[final_index].ligand_list[0].residue_name + ':' + props.pdb_ligand_inter_list[final_index].ligand_list[0].auth_residue_number
//   set_ligand()
// }, { deep: true })
const set_ligand_from_outer = () => {
  if (!first_render.value) {
    let flag = false;
    for (let i = 0; i < props.pdb_ligand_inter_list.length; i++) {
      for (let j = 0; j < props.pdb_ligand_inter_list[i].ligand_list.length; j++) {
        if (ligand.value === props.pdb_ligand_inter_list[i].pdb_name + ":" + props.pdb_ligand_inter_list[i].ligand_list[j].auth_asym_id + ":" + props.pdb_ligand_inter_list[i].ligand_list[j].residue_name + ":" + props.pdb_ligand_inter_list[i].ligand_list[j].auth_residue_number) {
          flag = true;
          break;
        }
      }
    }
    if (!flag) {
      const final_index = props.pdb_ligand_inter_list.length - 1;
      ligand.value = props.pdb_ligand_inter_list[final_index].pdb_name + ":" + props.pdb_ligand_inter_list[final_index].ligand_list[0].auth_asym_id + ":" + props.pdb_ligand_inter_list[final_index].ligand_list[0].residue_name + ":" + props.pdb_ligand_inter_list[final_index].ligand_list[0].auth_residue_number;
      set_ligand();
    }
  }
};

const loading = ref(null);

const open_loading = content => {
  if (loading.value) {
    loading.value.close();
    loading.value = null;
  }
  loading.value = ElLoading.service({
    target: document.getElementById("prolif_frame"),
    text: content,
    background: "rgba(255, 255, 255, 0.4)"
  });
};
const close_loading = () => {
  if (loading.value) {
    loading.value.close();
    loading.value = null;
  }
};

defineExpose({
  props,
  set_ligand_from_outer
});
</script>

<style scoped lang="scss">
.prolif_frame {
  position: relative;
}
.prolif_btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 200px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.prolif_lig_name {
  margin-right: 10px;
}
:deep(.el-radio-group) {
  display: inline-flex;
  align-items: flex-start;
  flex-direction: column;
}
</style>
