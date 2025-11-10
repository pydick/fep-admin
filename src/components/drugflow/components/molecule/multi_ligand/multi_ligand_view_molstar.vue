<template>
  <!-- 加载遮罩层 -->
  <div v-show="if_cover" class="cover_frame">
    <img src="@/assets/protein3DCover.png" class="cover_img" alt="protein3D cover" />
  </div>

  <!-- 配体控制面板 -->
  <div style="position: absolute; top: 2rem; right: 8px; z-index: 1001; height: calc(100% - 2rem)">
    <el-scrollbar style="height: calc(100% - 3rem); padding: 0 4px">
      <!-- 参考配体显示区域 -->
      <div v-if="has_refer" class="flex_def flex_column">
        <div class="flex_def flex_start">
          <!-- 参考配体显示控制复选框 -->
          <el-checkbox v-model="ref_check" style="margin-right: 0.6rem" @change="change_visible('0')" />
          <!-- 参考配体颜色标识 -->
          <div style="width: 14px; height: 14px; margin-right: 0.6rem; background: red; border: 1px solid #33333340" />
          <!-- 参考配体标签 -->
          <div style="font-size: 12px">{{ t("result.参考配体") }}</div>
        </div>
        <!-- 参考配体SMILES结构图 -->
        <SvgBox :smiles="refer_smiles" width="100" height="80" />
      </div>

      <!-- 配体列表显示区域 -->
      <div v-for="item in own_ligands_list" :key="item">
        <div class="flex_def flex_start">
          <!-- 配体显示控制复选框 -->
          <el-checkbox v-model="item.check" style="margin-right: 0.6rem" @change="change_visible(item.id)" />
          <!-- 配体颜色标识 -->
          <div :style="{ background: item.color }" style="width: 14px; height: 14px; margin-right: 0.6rem; border: 1px solid #33333340" />
          <!-- 配体名称 -->
          <div style="font-size: 12px">{{ item.ligand_show_name }}</div>
        </div>
        <!-- 配体SMILES结构图 -->
        <SvgBox :smiles="item.smiles" width="100" height="80" />
      </div>
    </el-scrollbar>
  </div>

  <!-- Molstar分子可视化容器 -->
  <div id="ngl_multi_ligand_frame" style="position: relative; width: 100%; min-width: 300px; height: 100%; min-height: 500px">
    <drugflow_molstar ref="molstar_ref" :if_sequence_panel="false" :disable_comp_btn="true" :prolif_show_ligname="false" @init-complete="init_draw" />
  </div>
</template>

<script>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import SvgBox from "@drugflow/common/svgBox.vue";
import drugflow_molstar from "@drugflow/components/molecule/drugflow_molstar.vue";
import { requireImg } from "@drugflow/common/utils.js";

export default {
  name: "multi_ligand_view_molstar",
  components: { SvgBox, drugflow_molstar },
  props: {
    // 是否有参考配体
    has_refer: { type: Boolean, default: true },
    // 参考配体的PDB字符串
    refer_pdb_string: { type: String, default: "" },
    // 参考配体的SMILES字符串
    refer_smiles: { type: String, default: "" },
    // 配体列表数据
    ligands_list: {
      type: Array,
      default: () => [
        { ligand_hex_id: "sdasda", ligand_smiles: "CCCCCCC", ligand_show_name: "1", pdb_string: "", residue_full_info: [] },
        { ligand_hex_id: "sa", ligand_smiles: "CCCCCCCNNN", ligand_show_name: "2", pdb_string: "", residue_full_info: [] },
        { ligand_hex_id: "23dasda", ligand_smiles: "C1CCCCCC1", ligand_show_name: "3", pdb_string: "", residue_full_info: [] }
      ]
    },
    // 渲染时机：immediately立即渲染，wait等待
    render_time: { type: String, default: "immediately" }
  },
  setup(props, context) {
    const { t } = useI18n();

    // 参考配体颜色列表（红色和银色）
    const color_list_ori_pdb = ref([
      { color: "red", count: 0 },
      { color: "silver", count: 0 }
    ]);

    // Molstar组件引用
    const molstar_ref = ref();

    // 配体颜色池，用于自动分配颜色
    const color_list = ref([
      { color: "blue", count: 0 },
      { color: "gray", count: 0 },
      { color: "orange", count: 0 },
      { color: "purple", count: 0 },
      { color: "green", count: 0 },
      { color: "pink", count: 0 },
      { color: "brown", count: 0 },
      { color: "yellow", count: 0 },
      { color: "cyan", count: 0 },
      { color: "magenta", count: 0 },
      { color: "lime", count: 0 },
      { color: "maroon", count: 0 },
      { color: "navy", count: 0 },
      { color: "olive", count: 0 },
      { color: "teal", count: 0 },
      { color: "aqua", count: 0 },
      { color: "black", count: 0 }
    ]);

    // 当前显示的配体列表
    const own_ligands_list = ref([]);
    // 当前配体的十六进制ID列表
    const own_ligands_hex_id_list = ref([]);
    // 参考配体显示状态
    const ref_check = ref(true);
    // 是否已绘制参考配体
    const drawed_refer = ref(false);
    // Molstar是否已初始化
    const init_molstar = ref(false);

    return {
      t,
      molstar_ref,
      color_list_ori_pdb,
      color_list,
      own_ligands_list,
      own_ligands_hex_id_list,
      ref_check,
      drawed_refer,
      init_molstar,
      requireImg
    };
  },
  watch: {},
  mounted() {
    // 组件挂载时打开加载动画
    this.open_loading();
  },
  onBeforeUnmount() {},
  unmounted() {},
  methods: {
    // Molstar初始化完成后的回调函数
    init_draw() {
      this.init_molstar = true;
      if (this.render_time === "immediately") {
        this.draw();
      }
    },

    // 绘制参考配体
    async draw_refer() {
      this.drawed_refer = true;
      if (this.refer_pdb_string) {
        const color = this.color_list_ori_pdb[0].color;
        await this.add_ligand_view(this.refer_pdb_string, undefined, 0, true, "ref", color, []);
      }
    },
    // 主要绘制方法：管理配体的添加、移除和更新
    async draw() {
      try {
        // 等待Molstar初始化完成
        if (!this.init_molstar) {
          setTimeout(() => {
            this.draw();
          }, 1500);
          return;
        }

        // 首次绘制时先绘制参考配体
        if (!this.drawed_refer) {
          this.drawed_refer = true;
          await this.draw_refer();
        }

        // 获取当前配体ID列表
        const ligands_hex_id_list = this.ligands_list.map(item => item.ligand_hex_id);

        // 移除不再需要的配体
        for (let i = 0; i < this.own_ligands_hex_id_list.length; i++) {
          if (ligands_hex_id_list.indexOf(this.own_ligands_hex_id_list[i]) === -1) {
            this.change_color_cnt(this.own_ligands_list[i].color, -1);
            // 从Molstar中移除配体视图
            await this.molstar_ref.remove_ligand_view_pdb(this.own_ligands_list[i].id);
            this.own_ligands_hex_id_list.splice(i, 1);
            this.own_ligands_list.splice(i, 1);
            i--;
          }
        }

        // 添加新的配体
        for (let i = 0; i < ligands_hex_id_list.length; i++) {
          if (this.own_ligands_hex_id_list.indexOf(ligands_hex_id_list[i]) === -1) {
            this.own_ligands_hex_id_list.push(ligands_hex_id_list[i]);
            const color = this.find_color();
            this.own_ligands_list.push({
              id: ligands_hex_id_list[i],
              smiles: this.ligands_list[i].ligand_smiles,
              pdb_string: this.ligands_list[i].pdb_string,
              ligand_show_name: this.ligands_list[i].ligand_show_name,
              residue_full_info: this.ligands_list[i].residue_full_info,
              check: true,
              color: color
            });
            // 在Molstar中添加配体视图
            await this.add_ligand_view(this.ligands_list[i].pdb_string, ligands_hex_id_list[i], i, false, this.ligands_list[i].ligand_show_name, color, this.ligands_list[i].residue_full_info);
          }
        }
        this.close_loading();
      } catch {
        this.close_loading();
      }
    },
    // 查找使用次数最少的颜色
    find_color() {
      // 找到第一个count最小的color
      let min_cnt = 999999;
      let min_color = "";
      let min_i = 0;
      for (let i = 0; i < this.color_list.length; i++) {
        if (this.color_list[i].count < min_cnt) {
          min_cnt = this.color_list[i].count;
          min_color = this.color_list[i].color;
          min_i = i;
        }
      }
      this.color_list[min_i].count += 1;
      return min_color;
    },

    // 更新颜色使用计数
    change_color_cnt(color, cnt) {
      for (let i = 0; i < this.color_list.length; i++) {
        if (this.color_list[i].color === color) {
          this.color_list[i].count += cnt;
          break;
        }
      }
    },
    // 在Molstar中添加配体视图
    async add_ligand_view(pdb_input_string, ligand_hex_id, ligand_cnt_id, is_refer_ligand, ligand_name, color, residue_full_info) {
      this.open_loading();

      // 设置渲染参数
      let if_clean = false;
      let render_id = ligand_hex_id;
      if (is_refer_ligand) {
        if_clean = true;
        render_id = "0";
      }

      // 构建Molstar输入参数
      const input_params = {
        url: undefined,
        format: "pdb",
        is_binary: false,
        input: pdb_input_string,
        if_render: true,
        render_type: "ligand_view",
        render_id: render_id,
        carbon_color: color,
        if_clean: if_clean,
        pdb_name: ligand_name,
        ligand_name: "UNL",
        residue_full_info: residue_full_info
      };

      // 加载结构到Molstar
      await this.molstar_ref.load_structure(input_params);
    },

    // 切换配体显示/隐藏状态
    change_visible(ligand_id) {
      this.molstar_ref.set_ligand_view_id_visibility(ligand_id);
    },
    // 打开加载动画
    open_loading(content) {
      this.if_cover = false;
      if (this.loading) {
        this.loading.close();
        this.loading = null;
      }
      this.loading = ElLoading.service({
        target: document.getElementById("ngl_multi_ligand_frame"),
        text: content,
        background: "rgba(255, 255, 255, 0.4)"
      });
    },

    // 关闭加载动画
    close_loading(flag) {
      console.log("innnnn", this.loading);
      if (this.loading) {
        this.loading.close();
      }
      this.loading = null;
      if (flag) {
        this.if_err = true;
      }
    }
  }
};
</script>
