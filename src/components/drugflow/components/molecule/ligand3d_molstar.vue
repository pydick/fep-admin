<template>
  <!-- 多配体分子可视化组件 -->
  <multi_ligand_view_molstar ref="molstar_ref" v-bind="ligand_view_dict" render_time="wait" />
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import multi_ligand_view_molstar from "./multi_ligand/multi_ligand_view_molstar.vue";
import { screen_get_pdb, screen_get_ori_pdb } from "@drugflow/api/screen";
import { pdbmock } from "@/views/inno-fep/pages/home/mockdata/pdbData.js";
import { mockSmiles } from "@/views/inno-fep/pages/home/mockdata/otherdata.js";

// 定义 props
const props = defineProps({
  // 任务ID
  job_id: { type: String, default: "" },
  // SMILES ID列表字符串
  smiles_id_list_str: { type: String, default: "" }
});

// Molstar组件引用
const molstar_ref = ref();
// 是否已初始化Molstar
const init_molstar = ref(false);
// 配体视图数据字典
const ligand_view_dict = ref({
  has_refer: false, // 是否有参考配体
  refer_smiles: "", // 参考配体的SMILES
  refer_pdb_string: "", // 参考配体的PDB字符串
  ligands_list: [] // 配体列表
});
// 是否首次绘制
const first_draw = ref(false);
// 已删除：不再需要单独的 ligands_id_list

// 绘制分子结构的主要方法
const draw = async () => {
  try {
    // 打开加载状态
    molstar_ref.value.open_loading();
    // 解析SMILES ID列表字符串为数组
    const smiles_id_list = JSON.parse(props.smiles_id_list_str);
    // 首次绘制时获取参考配体信息
    if (!first_draw.value) {
      try {
        // const res = await screen_get_ori_pdb(props.job_id);
        // if (res.show_ref_ligand) {
        //   ligand_view_dict.value.has_refer = true;
        //   ligand_view_dict.value.refer_smiles = res.smiles;
        //   ligand_view_dict.value.refer_pdb_string = res.pdb;
        // }
        ligand_view_dict.value.has_refer = true;
        ligand_view_dict.value.refer_smiles = mockSmiles;
        ligand_view_dict.value.refer_pdb_string = pdbmock;
        first_draw.value = true;
      } catch {
        console.log("no refer ligand");
      }
    }

    // 步骤1：从现有的配体列表中移除不在新SMILES列表中的配体
    // 提取新SMILES列表中的所有ID
    const smilesIds = smiles_id_list.map(item => item._id);
    // 过滤掉不在新列表中的配体，只保留有效的配体
    ligand_view_dict.value.ligands_list = ligand_view_dict.value.ligands_list.filter(ligand => smilesIds.includes(ligand.ligand_hex_id));

    // 步骤2：找出需要添加的新配体
    // 从当前配体列表中提取已有的ID
    const existingIds = ligand_view_dict.value.ligands_list.map(ligand => ligand.ligand_hex_id);
    // 过滤出不在已有列表中的新配体
    const newLigands = smiles_id_list.filter(item => !existingIds.includes(item._id));

    // 步骤3：如果有新配体，并行请求PDB数据并添加到列表
    if (newLigands.length > 0) {
      // 为每个新配体创建PDB数据请求Promise
      const pdbPromises = newLigands.map(item =>
        screen_get_pdb(props.job_id, item._id).then(res => ({
          id: item._id,
          smiles: item.SMILES,
          showId: item.show_id,
          residueFullInfo: item.values.residues_full_info,
          pdbData: res.data
        }))
      );

      // 并行等待所有PDB请求完成
      const pdbResults = await Promise.all(pdbPromises);

      // 将获取到的PDB数据添加到配体列表中
      pdbResults.forEach(result => {
        ligand_view_dict.value.ligands_list.push({
          ligand_hex_id: result.id,
          ligand_smiles: result.smiles,
          pdb_string: result.pdbData,
          ligand_show_name: result.showId,
          residue_full_info: result.residueFullInfo
        });
      });
    }
    // 标记Molstar已初始化
    init_molstar.value = true;

    // 调用Molstar组件绘制方法
    molstar_ref.value.draw();
  } catch {
    console.log("draw error");
  } finally {
    // 关闭加载状态
    molstar_ref.value.close_loading(false);
  }
};

// 监听SMILES ID列表变化
// watch(
//   () => props.smiles_id_list_str,
//   () => {
//     molstar_ref.value.open_loading();
//     draw();
//   }
// );

// 组件挂载后初始化
onMounted(() => {
  if (props.smiles_id_list_str !== "[]" && props.smiles_id_list_str !== "") {
    draw();
  }
});
</script>

<style lang="css" scoped>
/* 多配体分子可视化组件样式 */
</style>
