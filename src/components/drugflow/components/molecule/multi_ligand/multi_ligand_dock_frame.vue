<template>
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
    job_id: { type: String, default: "" },
    smiles_id_list_str: { type: String, default: "" }
  },
  setup(props, context) {
    const smiles_id_list_str_back = toRefs(props).smiles_id_list_str;
    const mol_list = ref([]);
    const molstar_ref = ref();
    const init_molstar = ref(false);
    const ligand_view_dict = ref({
      has_refer: false,
      refer_smiles: "",
      refer_pdb_string: "",
      ligands_list: []
    });
    const first_draw = ref(false);
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
    smiles_id_list_str_back() {
      this.molstar_ref.open_loading();
      this.draw();
    }
  },

  mounted() {
    this.$nextTick(() => {
      if (this.smiles_id_list_str !== "[]" && this.smiles_id_list_str !== "") {
        this.draw();
      }
    });
  },
  onBeforeUnmount() {},
  unmounted() {},
  methods: {
    close_loading() {
      const loading = ElLoading.service({
        background: "rgba(255, 255, 255, 0.4)"
      });
      loading.close();
    },
    debouncedDraw() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      // 设置一个新的延迟调用
      this.timeoutId = setTimeout(() => {
        this.draw();
      }, 200); // 延迟时间可以根据需要调整
    },
    async draw() {
      try {
        const smiles_id_list = JSON.parse(this.smiles_id_list_str);
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

        // 先移除ligand_view_dict.ligands_list多出来的id
        for (let i = 0; i < this.ligands_id_list.length; i++) {
          if (!smiles_id_list.map(item => item._id).includes(this.ligands_id_list[i])) {
            this.ligands_id_list.splice(i, 1);
            this.ligand_view_dict.ligands_list.splice(i, 1);
            i--;
          }
        }
        // 再添加新的id
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
        this.init_molstar = true;
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

<style lang="css" scoped></style>
