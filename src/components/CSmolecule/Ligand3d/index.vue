<template>
  <!-- 多配体分子可视化组件 -->
  <multi_ligand_view_molstar ref="molstar_ref" v-bind="ligand_view_dict" render_time="wait" />
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import multi_ligand_view_molstar from "./multi_ligand/multi_ligand_view_molstar.vue";
import { screen_get_pdb, screen_get_ori_pdb } from "@drugflow/api/screen";
import { appendProtein } from "@/api/fep";
import { originData } from "@/views/inno-fep/pages/home/mockdata/pdb/orgin.js";
import { pdb_5940408 } from "@/views/inno-fep/pages/home/mockdata/pdb/5940408-pdf.js";
import { pdb_5940409 } from "@/views/inno-fep/pages/home/mockdata/pdb/5940409-pdf.js";
import { pdb_5940410 } from "@/views/inno-fep/pages/home/mockdata/pdb/5940410-pdf.js";
import { mockSmiles } from "@/views/inno-fep/pages/home/mockdata/otherdata.js";

// 定义 props
const props = defineProps({
  // 任务ID
  // job_id: { type: String, default: "" },
  // SMILES ID列表字符串
  smiles_id_list_str: { type: String, default: "" },
  ligandData: { type: Object, default: () => ({}) },
  task_id: { type: String, default: "" }
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
  ligands_list: [], // 配体列表
  refer_smiles_name: "", // 参考配体的SMILES名称
  refer_smiles_id: "" // 参考配体的SMILES ID
});
// 是否首次绘制
const first_draw = ref(false);
// 已删除：不再需要单独的 ligands_id_list

// 绘制分子结构的主要方法
const draw = async () => {
  if (JSON.stringify(props.ligandData) === "{}") return;
  try {
    // 打开加载状态
    molstar_ref.value.open_loading();
    // 解析SMILES ID列表字符串为数组
    const smiles_id_list = JSON.parse(props.smiles_id_list_str);
    // 首次绘制时获取参考配体信息
    if (!first_draw.value) {
      // const res = await screen_get_ori_pdb(props.job_id);
      // if (res.show_ref_ligand) {
      //   ligand_view_dict.value.has_refer = true;
      //   ligand_view_dict.value.refer_smiles = res.smiles;
      //   ligand_view_dict.value.refer_pdb_string = res.pdb;
      // }
      ligand_view_dict.value.has_refer = true;
      ligand_view_dict.value.refer_smiles = props.ligandData.smiles;
      ligand_view_dict.value.refer_pdb_string = props.ligandData.pdb_file;
      ligand_view_dict.value.refer_smiles_name = props.ligandData.ligand_name;
      ligand_view_dict.value.refer_smiles_id = props.ligandData.ligand_number;
      console.log(666, ligand_view_dict.value);
      first_draw.value = true;
    }

    // 步骤1：从现有的配体列表中移除不在新SMILES列表中的配体
    // 提取新SMILES列表中的所有ID
    const smilesIds = smiles_id_list;
    // 过滤掉不在新列表中的配体，只保留有效的配体
    ligand_view_dict.value.ligands_list = ligand_view_dict.value.ligands_list.filter(ligand => smilesIds.includes(ligand.ligand_hex_id));

    // 步骤2：找出需要添加的新配体
    // 从当前配体列表中提取已有的ID
    const existingIds = ligand_view_dict.value.ligands_list.map(ligand => ligand.ligand_hex_id);
    // 过滤出不在已有列表中的新配体
    const newLigands = smiles_id_list.filter(id => !existingIds.includes(id));

    console.log(333, newLigands);

    // 步骤3：如果有新配体，并行请求PDB数据并添加到列表
    if (newLigands.length > 0) {
      // 为每个新配体创建PDB数据请求Promise
      const pdbPromises = newLigands.map(
        id =>
          appendProtein({ task_id: props.task_id, molecule_index: id }).then(res => ({
            id: id,
            smiles: res.data.smiles,
            showId: id,
            residueFullInfo: [],
            pdbData: res.data.pdb_file
          }))

        // {
        //   let pdbData = "";
        //   if (item._id === 5940408) {
        //     pdbData = pdb_5940408;
        //   } else if (item._id === 5940409) {
        //     pdbData = pdb_5940409;
        //   } else if (item._id === 5940410) {
        //     pdbData = pdb_5940410;
        //   }
        //   return {
        //     id: item._id,
        //     smiles: item.SMILES,
        //     showId: item.show_id,
        //     residueFullInfo: item.values.residues_full_info,
        //     pdbData: pdbData
        //   };
        // }
      );

      // 并行等待所有PDB请求完成
      const pdbResults = await Promise.all(pdbPromises);
      console.log(666, pdbResults);

      // 将获取到的PDB数据添加到配体列表中
      const addLigandsList = pdbResults.reduce((acc, result) => {
        acc.push({
          ligand_hex_id: result.id,
          ligand_smiles: result.smiles,
          pdb_string: result.pdbData,
          ligand_show_name: result.showId,
          residue_full_info: result.residueFullInfo
        });
        return acc;
      }, []);
      ligand_view_dict.value.ligands_list.push(...addLigandsList);
    }
    // 标记Molstar已初始化
    init_molstar.value = true;
    // 使用 nextTick 等待 props 更新完成后再调用 draw
    // await nextTick();
    // 调用Molstar组件绘制方法
    molstar_ref.value.draw();
  } catch (err) {
    console.log("draw error", err);
  } finally {
    // 关闭加载状态
    molstar_ref.value.close_loading(false);
  }
};
watch(
  () => props.ligandData,
  async () => {
    await nextTick();
    draw();
  }
);

// 监听SMILES ID列表变化
watch(
  () => props.smiles_id_list_str,
  () => {
    draw();
  }
);

// 组件挂载后初始化
onMounted(() => {
  draw();
});
</script>

<style lang="css" scoped>
/* 多配体分子可视化组件样式 */
</style>
