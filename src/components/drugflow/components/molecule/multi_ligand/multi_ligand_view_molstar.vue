<template>
  <div v-show="if_cover" class="cover_frame">
    <img :src="requireImg('assets/protein3DCover.png')" alt="protein3D cover" class="cover_img" />
  </div>
  <div style="position: absolute; top: 2rem; right: 8px; z-index: 1001; height: calc(100% - 2rem)">
    <el-scrollbar style="height: calc(100% - 3rem); padding: 0 4px">
      <div v-if="has_refer" class="flex_def flex_column">
        <div class="flex_def flex_start">
          <el-checkbox v-model="ref_check" style="margin-right: 0.6rem" @change="change_visible('0')" />
          <div style="width: 14px; height: 14px; border: 1px solid #33333340; margin-right: 0.6rem; background: red" />
          <div style="font-size: 12px">{{ t("result.参考配体") }}</div>
        </div>
        <SvgBox :smiles="refer_smiles" width="100" height="80" />
      </div>
      <div v-for="item in own_ligands_list" :key="item">
        <div class="flex_def flex_start">
          <el-checkbox v-model="item.check" style="margin-right: 0.6rem" @change="change_visible(item.id)" />
          <div :style="{ background: item.color }" style="width: 14px; height: 14px; border: 1px solid #33333340; margin-right: 0.6rem" />
          <div style="font-size: 12px">{{ item.ligand_show_name }}</div>
        </div>
        <SvgBox :smiles="item.smiles" width="100" height="80" />
      </div>
    </el-scrollbar>
  </div>
  <div id="ngl_multi_ligand_frame" style="position: relative; min-height: 500px; height: calc(100% + 1px); min-width: 300px; width: calc(100% + 1px)">
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
    has_refer: { type: Boolean, default: true },
    refer_pdb_string: { type: String, default: "" },
    refer_smiles: { type: String, default: "" },
    ligands_list: {
      type: Array,
      default: () => [
        { ligand_hex_id: "sdasda", ligand_smiles: "CCCCCCC", ligand_show_name: "1", pdb_string: "", residue_full_info: [] },
        { ligand_hex_id: "sa", ligand_smiles: "CCCCCCCNNN", ligand_show_name: "2", pdb_string: "", residue_full_info: [] },
        { ligand_hex_id: "23dasda", ligand_smiles: "C1CCCCCC1", ligand_show_name: "3", pdb_string: "", residue_full_info: [] }
      ]
    },
    render_time: { type: String, default: "immediately" }
  },
  setup(props, context) {
    const { t } = useI18n();
    const color_list_ori_pdb = ref([
      { color: "red", count: 0 },
      { color: "silver", count: 0 }
    ]);
    const molstar_ref = ref();
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

    const own_ligands_list = ref([]);
    const own_ligands_hex_id_list = ref([]);
    const ref_check = ref(true);
    const drawed_refer = ref(false);
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
    this.open_loading();
  },
  onBeforeUnmount() {},
  unmounted() {},
  methods: {
    init_draw() {
      this.init_molstar = true;
      if (this.render_time === "immediately") {
        this.draw();
      }
    },
    async draw_refer() {
      this.drawed_refer = true;
      if (this.refer_pdb_string) {
        const color = this.color_list_ori_pdb[0].color;
        await this.add_ligand_view(this.refer_pdb_string, undefined, 0, true, "ref", color, []);
      }
    },
    async draw() {
      try {
        if (!this.init_molstar) {
          setTimeout(() => {
            this.draw();
          }, 1500);
          return;
        }

        if (!this.drawed_refer) {
          this.drawed_refer = true;
          await this.draw_refer();
        }
        const ligands_hex_id_list = this.ligands_list.map(item => item.ligand_hex_id);
        // 先移除own_ligands_hex_id_list多出来的id, 并更改color cnt
        for (let i = 0; i < this.own_ligands_hex_id_list.length; i++) {
          if (ligands_hex_id_list.indexOf(this.own_ligands_hex_id_list[i]) === -1) {
            this.change_color_cnt(this.own_ligands_list[i].color, -1);
            // remove ligand view
            await this.molstar_ref.remove_ligand_view_pdb(this.own_ligands_list[i].id);
            this.own_ligands_hex_id_list.splice(i, 1);
            this.own_ligands_list.splice(i, 1);
            i--;
          }
        }
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
            // add ligand view
            await this.add_ligand_view(this.ligands_list[i].pdb_string, ligands_hex_id_list[i], i, false, this.ligands_list[i].ligand_show_name, color, this.ligands_list[i].residue_full_info);
          }
        }
        this.close_loading();
      } catch {
        this.close_loading();
      }
    },
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
    change_color_cnt(color, cnt) {
      for (let i = 0; i < this.color_list.length; i++) {
        if (this.color_list[i].color === color) {
          this.color_list[i].count += cnt;
          break;
        }
      }
    },
    async add_ligand_view(pdb_input_string, ligand_hex_id, ligand_cnt_id, is_refer_ligand, ligand_name, color, residue_full_info) {
      this.open_loading();
      // load new data
      let if_clean = false;
      let render_id = ligand_hex_id;
      if (is_refer_ligand) {
        if_clean = true;
        render_id = "0";
      }
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
      await this.molstar_ref.load_structure(input_params);
    },
    change_visible(ligand_id) {
      this.molstar_ref.set_ligand_view_id_visibility(ligand_id);
    },
    open_loading(content) {
      this.if_cover = false;
      if (this.loading) {
        this.loading.close();
        this.loading = null;
      }
      this.loading = ElLoading.service({
        // target: document.getElementById('ngl_multi_ligand_frame'),
        text: content,
        background: "rgba(255, 255, 255, 0.4)"
      });
    },
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
