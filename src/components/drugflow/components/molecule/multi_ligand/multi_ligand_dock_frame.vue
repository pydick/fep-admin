<template>
  <!-- 多配体分子可视化组件 -->
  <multi_ligand_view_molstar ref="molstar_ref" :has_refer="ligand_view_dict.has_refer" :refer_pdb_string="ligand_view_dict.refer_pdb_string" :refer_smiles="ligand_view_dict.refer_smiles" :ligands_list="ligand_view_dict.ligands_list" render_time="wait" />
</template>

<script>
import { ref, toRefs } from "vue";
import multi_ligand_view_molstar from "@drugflow/components/molecule/multi_ligand/multi_ligand_view_molstar.vue";
import { screen_get_pdb, screen_get_ori_pdb } from "@drugflow/api/screen";

export default {
  name: "multi_ligand_vs_frame",
  components: { multi_ligand_view_molstar },
  props: {
    // 任务ID
    job_id: { type: String, default: "" },
    // SMILES ID列表字符串
    smiles_id_list_str: { type: String, default: "" }
  },
  setup(props, context) {
    // 响应式引用SMILES ID列表字符串
    const smiles_id_list_str_back = toRefs(props).smiles_id_list_str;
    // 分子列表
    const mol_list = ref([]);
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
    // 配体ID列表
    const ligands_id_list = ref([]);

    return {
      smiles_id_list_str_back,
      mol_list,
      molstar_ref,
      ligand_view_dict,
      init_molstar,
      first_draw,
      ligands_id_list
    };
  },
  watch: {
    // 监听SMILES ID列表变化
    smiles_id_list_str_back() {
      this.molstar_ref.open_loading();
      this.draw();
    }
  },

  mounted() {
    // 组件挂载后初始化
    this.$nextTick(() => {
      if (this.smiles_id_list_str !== "[]" && this.smiles_id_list_str !== "") {
        this.draw();
      }
    });
  },
  onBeforeUnmount() {},
  unmounted() {},
  methods: {
    // 关闭加载动画
    close_loading() {
      const loading = ElLoading.service({
        background: "rgba(255, 255, 255, 0.4)"
      });
      loading.close();
    },
    // 防抖绘制方法
    debouncedDraw() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      // 设置一个新的延迟调用
      this.timeoutId = setTimeout(() => {
        this.draw();
      }, 200); // 延迟时间可以根据需要调整
    },
    // 绘制分子结构的主要方法
    async draw() {
      try {
        // 解析SMILES ID列表
        const smiles_id_list = JSON.parse(this.smiles_id_list_str);

        // 首次绘制时获取参考配体信息
        if (!this.first_draw) {
          try {
            const res = await screen_get_ori_pdb(this.job_id);
            if (res.show_ref_ligand) {
              this.ligand_view_dict.has_refer = true;
              this.ligand_view_dict.refer_smiles = res.smiles;
              this.ligand_view_dict.refer_pdb_string = res.pdb;
            }
            this.first_draw = true;
          } catch {
            console.log("no refer ligand");
          }
        }

        // 先移除ligand_view_dict.ligands_list中多余的id
        for (let i = 0; i < this.ligands_id_list.length; i++) {
          if (!smiles_id_list.map(item => item._id).includes(this.ligands_id_list[i])) {
            this.ligands_id_list.splice(i, 1);
            this.ligand_view_dict.ligands_list.splice(i, 1);
            i--;
          }
        }

        // 再添加新的id对应的配体数据
        for (let i = 0; i < smiles_id_list.length; i++) {
          if (!this.ligands_id_list.includes(smiles_id_list[i]._id)) {
            const res = await screen_get_pdb(this.job_id, smiles_id_list[i]._id);
            this.ligands_id_list.push(smiles_id_list[i]._id);
            this.ligand_view_dict.ligands_list.push({
              ligand_hex_id: smiles_id_list[i]._id,
              ligand_smiles: smiles_id_list[i].SMILES,
              pdb_string: res.data,
              ligand_show_name: smiles_id_list[i].show_id,
              residue_full_info: smiles_id_list[i].values.residues_full_info
            });
          }
        }

        // 标记Molstar已初始化
        this.init_molstar = true;

        // 在下一个tick中绘制分子结构
        this.$nextTick(() => {
          try {
            this.molstar_ref.draw();
          } catch {
            this.close_loading();
          }
        });
      } catch {
        this.close_loading();
      }
    }
  }
};
</script>

<style lang="css" scoped>
/* 多配体分子可视化组件样式 */
</style>
