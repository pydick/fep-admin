<script>
import { reactive, ref } from "vue";
import protein3d_molstar from "@/components/CSmolecule/Protein3d/index.vue";
// import app_frame from "@drugflow/components/layout/app_frame.vue";
import { data } from "./data.js";
import doc_link from "@drugflow/components/layout/doc_link.vue";
import SvgBox from "@drugflow/common/svgBox.vue";
import Data_select from "@drugflow/common/data_select.vue";
import Spinner from "@drugflow/common/spinner.vue";
import Upload from "@drugflow/common/upload.vue";
import task_card from "@drugflow/components/task/task_card.vue";
import csv_details from "@drugflow/components/file_process/csv_details.vue";
import multi_ligand_dock_frame from "@drugflow/components/molecule/multi_ligand/multi_ligand_dock_frame.vue";
import { data2 } from "./data2.js";
import TestSvg from "@/assets/svg/dymicTest.svg?component";

export default {
  name: "Test",
  components: {
    Protein3dMolstar: protein3d_molstar,
    // app_frame,
    doc_link,
    SvgBox,
    Data_select,
    Spinner,
    Upload,
    task_card,
    csv_details,
    multi_ligand_dock_frame,
    TestSvg
  },
  setup() {
    const form = reactive({
      is_isomer: true,
      need_prot_process: true,
      smiles_col: "",
      input_tab: "数据库导入",
      pdbid_url: "",
      pdb_id: "",
      pdb_dataset_id: "",
      ligands_id: "",
      pdbid_input: "",
      pdbid_select: "",
      protein_file: "",
      pdb_name: "",
      pdbfile_validate_status: "",
      ligandfile_validate_status: "",
      protein_chain: [],
      het_group: [],
      correct: true,
      protonation: true,
      charge: "amber14/protein.ff14SB",
      minimize_flag: "atoms",
      minimized: null,
      missing_residue: [],
      missing_residue_list: [],
      pdb: "pdb_file",
      chain: [],
      add_missing_residue: true,
      addh: true,
      modify_protonation: true,
      ph: 7.4,
      opt_hydrogen: true,
      energy_min: true,
      force_field: "amber14/protein.ff14SB",

      ligand_input_tab: "上传文件",
      ligand_file: "",
      ligand_smiles: "",
      ligand_example_select: "",
      Disconnect_group: true,
      keep_large_fragment: true,
      Ionization: "set_pH",
      Ionization_pH_main: 7.4,
      Ionization_pH_sub: 0.2,
      Tautomers: false,
      Stereoisomers: "retain",
      isomer_limit: 5,
      ligand_energy_minimize: "MMFF94",

      X_center: null,
      Y_center: null,
      Z_center: null,
      X_dimension: null,
      Y_dimension: null,
      Z_dimension: null,
      mode: "semi",
      distance: null,
      scoring: "carsidock",
      rescoring: ["RTMS"],
      num_pose: 1,
      task_name: "Docking Task",
      // box_ligand: 'default',
      box_ligand: "A:KY9:1102",
      box_changed_by_user: false,
      irrelevant_waters: false,
      het_group: [],
      delete_water: []
    });
    const ligand_smiles = reactive(["CC(C)CC1=CC=C(C=C1)C(C)C(O)=O", "COC1=CC2=C(C=C1)N=C(N2)S(=O)CC1=NC=C(C)C(OC)=C1C", "COCCC1=CC=C(OCC(O)CNC(C)C)C=C1"]);
    const theme = ref("light");
    const if_show_box = ref(true);
    const molstar3dRef = ref(null);
    const show_data_list = ref(false);
    const data_list = reactive([
      {
        id: 4532,
        name: "4DJV_pre_DFFixed.pdb",
        source: '{"module":"vitrual-screening"}',
        dataset_id: "zq91sqnxqbpjsff0",
        created_at: "2025-09-15T03:25:36.588525Z",
        extras: null
      },
      {
        id: 4531,
        name: "4DJV_pre.pdb",
        source: '{"module":"protein_process","job_id":"15213"}',
        dataset_id: "6vgl0r3tulybfjk1",
        created_at: "2025-09-12T05:58:15.919653Z",
        extras: null
      }
    ]);
    const task_name = ref("Docking Task");
    const ori_task_name = ref("Docking Task");
    const protein_name = ref("");
    const ligands_id = ref("87mv48bkbrtwtvtd");
    const label_col = reactive(["Smiles"]);
    const task_id = ref("15190");
    const frame_data = data2;
    return { frame_data, form, theme, if_show_box, molstar3dRef, ligand_smiles, show_data_list, data_list, protein_name, task_name, ori_task_name, label_col, ligands_id, task_id };
  },
  mounted() {
    setTimeout(() => {
      this.$refs.molstar3dRef.loadStructure(data, "pdb");
    }, 3000);
  },
  methods: {
    show_protein() {
      this.$refs.molstar3dRef.loadStructure(data, "pdb");
    },
    show_Data_select() {
      this.show_data_list = true;
    },
    show_spinner_ref() {
      this.$refs.spinner_ref.show();
    },
    handle_space_id(id) {
      console.log(id);
    },
    change_tab(tab_name) {
      console.log(tab_name);
    }
  }
};
</script>

<template>
  <div class="drugflow-scope">
    <!-- <p>-------------配体预览------------------</p>
    <div style="position: relative; width: 800px; height: 800px">
      <multi_ligand_dock_frame ref="ngl_ref" :job_id="task_id" :smiles_id_list_str="JSON.stringify(frame_data)" />
    </div> -->
    <p>-------------分子预览------------------</p>
    <div style="width: 800px; height: 800px">
      <el-button @click="show_protein">show_protein</el-button>
      <Protein3dMolstar ref="molstar3dRef" v-model:box_x="form.X_center" v-model:box_y="form.Y_center" v-model:box_z="form.Z_center" v-model:l1="form.X_dimension" v-model:l2="form.Y_dimension" v-model:l3="form.Z_dimension" v-model:ligand_select="form.box_ligand" v-model:theme="theme" v-model:if_changed_box="form.box_changed_by_user" :if_show_box="if_show_box" />
    </div>
    <!-- <p>-------------doc_link----------------------</p>
    <doc_link algo_type="Docking" />

    <p>-------------svgBox------------------</p>
    <svgBox ref="svg_box" :if_wait="true" width="200px" height="200px" />
    <TestSvg />
    <p>----------------Data_select------------</p>
    <el-button @click="show_Data_select">show_Data_select</el-button>
    <Data_select v-model:if_show="show_data_list" :data_list="data_list" :name="'hale'" />
    <p>--------Spinner------------</p>
    <el-button @click="show_spinner_ref">show_spinner_ref</el-button>
    <Spinner ref="spinner_ref" style="background: #fff" :full_screen="false" />
    <p>-------------Upload-------------</p>
    <upload :file_name="protein_name" :inp_placeholder="'screen.上传'" :ws_id="'898mg9qjbdlknrdh'" file_accept=".pdb" task_type="docking" :is_slot="false" />
    <p>----------task_card-----------------</p>
    <task_card v-model:task_name="task_name" :ori_task_name="ori_task_name" :space_id="103" task_type="docking" @goto_tab="change_tab" />
    <p>-----------------------------csv_details------------------</p>
    <csv_details ref="csv_details_ref" :dataset_id="ligands_id" :is_overview="false" :smiles_label="label_col" /> -->
    <!-- <P>--------app_frame-----------</P>
    <app_frame tab_name="Docking" @space_id="handle_space_id">
      <template #title>title</template>
      <div class="bg_ff_gradient" style="padding: 0 2rem" />
    </app_frame> -->
  </div>
</template>

<style lang="scss" scoped></style>
