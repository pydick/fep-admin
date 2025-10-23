<script setup lang="ts">
import ProteinInput from "./components/ProteinInput/index.vue";
import Data_select from "../components/data_select.vue";
import { data } from "./data.js";
import { inject, ref, reactive, onMounted } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import CSupload from "@/components/CSupload/index.vue";
import CSspinner from "@/components/CSspinner/index.vue";
import { check_pdb_api, datalists, basic_info, ds_duplicate, examples, get_space, pdb_ctx, pdb_datalists, upload } from "@/api/data";
import { pxToRem } from "@/utils/rem";
import { ossList, ossGetDownload, proteinInfo, fetchFileAsBlob } from "@/api/fep";
import { ossBucket } from "@/config/api";
import { binaryToUploadFile } from "@/utils/common";

import { debounce } from "@pureadmin/utils";
defineOptions({
  name: "ProteinPreprocess"
});
const protein3dRef = inject("protein3dRef");

let exampleList = ref([]);

//------------------
const form = reactive({
  input_tab: "数据库导入",
  need_prot_process: true,
  pdbfile_validate_status: "",
  pdbid_input: "",
  pdbid_select: "",
  protein_data: "",
  pdb_id: "",
  protein_file: "",
  pdbid_url: "",
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
  box_changed_by_user: false,
  box_ligand: "default",
  pdb_dataset_id: "",
  pdb_name: "",
  irrelevant_waters: false,
  delete_water: []
});
const space = ref(null);
const protein_name = ref("");
const if_have_protein = ref(false);
const if_chain = ref(false);
const spinner_ref = ref();
const pdbid_url_ref = ref();
const if_show_box = ref(false);
const protein_content = ref([]);
const protein_ligand_content = ref([]);
const box_option = ref([]);
const box_ligand = ref("default");
const show_data_list = ref(false);
const dialog_type = ref("protein");
const data_list = ref([]);
const ligand_list = ref([]);
const sample_pdb_list = ref([]);
const sample_mol_list = ref([]);
const charge_option = reactive([
  {
    key: 0,
    label: "AMBER FF14SB",
    value: "amber14/protein.ff14SB",
    if_selected: true
  },
  {
    key: 1,
    label: "AMBER FF15IPQ",
    value: "amber14/protein.ff15ipq",
    if_selected: false
  },
  {
    key: 3,
    label: "AMBER96",
    value: "amber96",
    if_selected: false
  },
  {
    key: 4,
    label: "AMBER99SB",
    value: "amber99sb",
    if_selected: false
  },
  {
    key: 5,
    label: "CHARMM36",
    value: "charmm36",
    if_selected: false
  }
]);
const chain_select_fn = data => {
  data.struct_asym_id = data.chain_id;
  protein3dRef.value.select_and_focus(data);
};

const checkurl = (rule, value, callback) => {
  const tmp = value.split("//")[1];
  const reg = /^[A-Za-z0-9]+$/;
  if (tmp !== "test") {
    if (!reg.test(tmp)) {
      callback(new Error("请输入正确PDBID"));
    } else {
      if (tmp.length > 4) {
        callback(new Error("请输入正确PDBID"));
      } else {
        callback();
      }
    }
  } else {
    callback();
  }
};
const check_pdb = file => {
  const formData = new FormData();
  formData.append("pdb_file", file);
  return check_pdb_api(formData);
};

const show_dialog = async () => {
  const res = await ossList({ proteins: "proteins", bucket: ossBucket });
  console.log(111, res);
  if (res.success) {
    data_list.value = res.objects.map(item => ({
      dataset_id: item.Key,
      name: item.filename || item.Key
    }));
    show_data_list.value = true;
  }
};
const handleCustomEvent = ({ id }) => {
  getPdbById(id);
};

const show_dialog1 = type => {
  get_datalists();
  show_data_list.value = true;
  if (type === "protein") {
    dialog_type.value = "protein";
  } else {
    dialog_type.value = "ligand";
  }
};
const check_box_ligand = (rule, value, callback) => {
  if (form.need_prot_process) {
    let check_chain = 0;
    form.protein_chain.map(item => {
      if (item.if_checked == true) {
        check_chain++;
      }
    });
    if (check_chain > 0) {
      callback();
    } else {
      callback(new Error("至少选择一条蛋白链"));
    }
  } else {
    callback();
  }
};
const get_datalists = () => {
  datalists(space.value.ws_id, "pdb").then(res => {
    data_list.value = res.data;
  });
  datalists(space.value.ws_id, "mol").then(res => {
    ligand_list.value = res.data;
  });
};
const get_basic_info = () => {
  const formData = new FormData();
  formData.append("pdb", form.protein_file);
  spinner_ref.value.show();
  basic_info(formData).then(res => {
    spinner_ref.value.hide();
    res.data.chains.map(item => {
      item.if_checked = true;
    });
    form.protein_chain = res.data.chains;
    res.data.hets.map(item => {
      item.if_checked = true;
    });
    form.het_group = res.data.hets;
  });
};
const show_protein = (file_or_pdbid, format = "pdb") => {
  if_show_box.value = false;
  form.box_changed_by_user = false;
  protein3dRef.value
    .loadStructure(file_or_pdbid, format)
    .then(res => {
      protein_content.value = res.protein_content;
      protein_ligand_content.value = res.protein_lig_content;
      if_have_protein.value = true;
      if_chain.value = true;
      // this.draw_protein_content()
      draw_ligand_box_select();
      const formData = new FormData();
      formData.append("pdb", form.protein_file);
    })
    .catch(err => {
      console.error(err);
      if_have_protein.value = false;
      if_chain.value = false;
    });
};
const draw_ligand_box_select = (chain_name = "blank", flag = true) => {
  if (chain_name !== "blank") {
    for (let j = 0; j < protein_ligand_content.value.length; j++) {
      if (protein_ligand_content.value[j].chain_name === chain_name) {
        protein_ligand_content.value[j].show_option = flag;
      }
    }
  }
  box_option.value = [];
  form.box_ligand = "default";
  let max_count = 0;
  let max_ligand = 0;
  for (let i = 0; i < protein_ligand_content.value.length; i++) {
    if (protein_ligand_content.value[i].show_option === true) {
      if (protein_ligand_content.value[i].count > max_count) {
        max_count = protein_ligand_content.value[i].count;
        max_ligand = box_option.value.length;
      }
      box_option.value.push({
        id: i,
        label: protein_ligand_content.value[i].name,
        value: protein_ligand_content.value[i].name,
        content: protein_ligand_content.value[i],
        if_selected: false
      });
    }
  }
  if (box_option.value.length) {
    box_option.value[max_ligand].if_selected = true;
    box_option.value[box_option.value.length - 1].if_selected = false;
    form.box_ligand = box_option.value[max_ligand].value;
    box_ligand.value = box_option.value[max_ligand].value;
  }
};

const het_select_fn = data => {
  protein3dRef.value.select_and_focus(data);
};

const chain_change = async (data, value) => {
  await protein3dRef.value.change_chain(data.chain_id, value);
  draw_ligand_box_select(data.chain_id, value);

  protein3dRef.value.select_none();
  const hets = [];
  for (let i = 0; i < form.het_group.length; i++) {
    if (form.het_group[i].chain_id === data.chain_id) {
      form.het_group[i].if_checked = value;
      hets.push({ auth_asym_id: form.het_group[i].chain_id, residue_number: form.het_group[i].residue_number });
    }
  }
  if (hets.length > 0) {
    await protein3dRef.value.quick_select(hets);
    if (value) {
      await protein3dRef.value.show_selection("ligand");
    } else {
      await protein3dRef.value.hide_selection();
    }
  }
  protein3dRef.value.reset_camera();
  protein3dRef.value.select_none();
};

const get_pdb_info = () => {
  return protein3dRef.value.get_pdb_info();
};
const quick_delete_click = async () => {
  const water_dict_list = get_pdb_info().water;
  const water_data = [];

  if (form.het_group.length == 0) return;
  for (let i = 0; i < form.het_group.length; i++) {
    form.het_group[i].water_within_dist = form.het_group[i].water_within_dist.filter(item => item.if_water_bridge == true);
  }
  form.irrelevant_waters = true;

  protein3dRef.value.select_none();

  for (let k = 0; k < water_dict_list.length; k++) {
    let flag = true;
    for (let i = 0; i < form.het_group.length; i++) {
      const data = form.het_group[i].water_within_dist;
      for (let j = 0; j < data.length; j++) {
        if (data[j].residue_number == water_dict_list[k].auth_residue_number && data[j].chain_id == water_dict_list[k].auth_asym_id) {
          flag = false;
          break;
        }
      }
      if (!flag) {
        break;
      }
    }
    if (flag) {
      water_data.push({ auth_residue_number: water_dict_list[k].auth_residue_number, auth_asym_id: water_dict_list[k].auth_asym_id });
    }
  }
  // hide_params = water_info.filter(item => item.auth_residue_number !== show_params[i].auth_residue_number)
  if (water_data.length == 0) return;
  protein3dRef.value.quick_select(water_data);
  protein3dRef.value.hide_selection();
  protein3dRef.value.select_none();
};

const delete_single_het = (ind, val, index) => {
  // 如果水分子被配体禁用，则不允许删除
  if (val.disabled_by_ligand) {
    return;
  }
  form.delete_water.push({ residue_number: val.residue_number, chain_id: val.chain_id });
  form.het_group[ind].water_within_dist.splice(index, 1);
  protein3dRef.value.select_show_hide(val, false);
};

const single_het_click = data => {
  protein3dRef.value.select_and_focus(data);
};

const uploadSuc = id => {
  getPdbById(id);
};
const pdbidInput = debounce(value => {
  const id = `proteins/${value}.pdb`;
  getPdbById(id);
}, 2000);

const het_change = async (data, value) => {
  protein3dRef.value.select_none();

  await protein3dRef.value.quick_select({ auth_asym_id: data.chain_id, residue_number: data.residue_number }, "single", true);

  if (value) {
    protein3dRef.value.show_selection("ligand");
    const hetIndex = form.het_group.findIndex(item => item.chain_id === data.chain_id && item.residue_number === data.residue_number);
    if (hetIndex !== -1) {
      form.het_group[hetIndex].water_within_dist.forEach(water => {
        water.disabled_by_ligand = false;
        // 从删除列表中移除这些水分子
        const waterIndex = form.delete_water.findIndex(w => w.residue_number === water.residue_number && w.chain_id === water.chain_id);
        if (waterIndex !== -1) {
          form.delete_water.splice(waterIndex, 1);
        }
      });
    }
  } else {
    protein3dRef.value.hide_selection();
    // 当配体被取消选择时，将其周围的水分子标记为不可用
    const hetIndex = form.het_group.findIndex(item => item.chain_id === data.chain_id && item.residue_number === data.residue_number);
    if (hetIndex !== -1) {
      form.het_group[hetIndex].water_within_dist.forEach(water => {
        water.disabled_by_ligand = true;
        // 自动将这些水分子添加到删除列表中
        const waterExists = form.delete_water.some(w => w.residue_number === water.residue_number && w.chain_id === water.chain_id);
        if (!waterExists) {
          form.delete_water.push({
            residue_number: water.residue_number,
            chain_id: water.chain_id
          });
        }
      });
    }
  }
};

const exampleChoose = async id => {
  getPdbById(id);
};
const getPdbById = async id => {
  const res = await ossGetDownload({ key: id, bucket: ossBucket, return_url: false });
  if (res.status === 200) {
    const filename = res.headers["content-disposition"].split("filename=")[1].replace(/"/g, "");
    show_protein(res.data, "pdb");
    const file = binaryToUploadFile(res.data, filename);
    const formData = new FormData();
    formData.append("file", file.raw);
    const proteinRes = await proteinInfo(formData);
    if (proteinRes.success) {
      form.protein_chain = proteinRes.data.chains.map(item => ({ if_checked: true, ...item }));
      form.het_group = proteinRes.data.hets.map(item => ({ if_checked: true, ...item }));
    }
  }
};

const get_pdb_by_id_select = () => {
  form.pdb_dataset_id = form.pdbid_select;
  if (form.pdbid_select) {
    form.pdbid_input = "";
    protein_name.value = "";
    form.protein_data = "";
    protein3dRef.value.open_loading("文件下载中");
    form.pdbid_url = "rcsb://test";
    pdb_datalists(form.pdbid_select).then(res => {
      pdb_ctx(res[0].inuse_path)
        .then(data => {
          const file = new Blob([data.data], { type: "text/plain" });
          form.protein_file = file;
          form.pdb_name = res.data[0].file_name;
          show_protein(data.data, "pdb");
          get_basic_info();
          if_have_protein.value = true;
          form.pdb_id = form.pdbid_select;
        })
        .catch(err => {
          console.error(err);
        });
    });
  } else {
    this.if_have_protein = false;
  }
};

const get_pdb_by_id_input = () => {
  return new Promise((resolve, reject) => {
    if (form.pdbid_input) {
      form.pdbid_select = "";
      form.protein_name = "";
      form.protein_data = "";
      form.pdb_id = form.pdbid_input;
      form.pdbfile_validate_status = "";

      pdbid_url_ref.value.validateMessage = "";

      form.pdbid_url = "rcsb://" + form.pdbid_input;
      const reg = /^[A-Za-z0-9]+$/;
      if (!reg.test(form.pdbid_input)) {
        return;
      }

      if (form.pdbid_input.length === 4) {
        spinner_ref.value.show();
        const httpRequest = new XMLHttpRequest();
        httpRequest.open("GET", "http://files.rcsb.org/download/" + form.pdbid_input + ".pdb", true);
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
          if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            const data = httpRequest.responseText;
            const file = new Blob([data], { type: "text/plain" });
            check_pdb(file).then(check_pdb_res => {
              spinner_ref.value.hide();
              if (check_pdb_res.data.status) {
                if (check_pdb_res.data.pdb_string) {
                  form.protein_file = new Blob([check_pdb_res.data.pdb_string], {
                    type: "text/plain"
                  });
                  show_protein(check_pdb_res.data.pdb_string, "pdb");
                } else {
                  form.protein_file = file;
                  show_protein(data, "pdb");
                }
                if (check_pdb_res.data.msg && check_pdb_res.data.msg !== "[]" && check_pdb_res.data.msg.indexOf("The distances between residues are too close") !== -1) {
                  ElMessageBox.alert("The distances between residues are too close!", "警告", {
                    confirmButtonText: "OK",
                    type: "warning"
                  });
                }

                // this.form.protein_data = this.form.pdbid_input + '.pdb'
                // this.form.pdb_name = this.form.pdbid_input + '.pdb'

                if_have_protein.value = true;
                get_basic_info();
              } else {
                ElMessageBox.alert("There are some issues with the file you uploaded, which has caused the platform to be unable to parse it. Please make the necessary modifications before uploading. <br><br>Error message: " + check_pdb_res.data.msg, "错误信息", {
                  confirmButtonText: "OK",
                  type: "error",
                  dangerouslyUseHTMLString: true
                });
              }
            });
          } else if (httpRequest.status === 404) {
            spinner_ref.value.hide();
            form.pdbfile_validate_status = "error";
            pdbid_url_ref.value.validateMessage = "请输入正确PDBID";
          }
        };
      }
    } else {
      if_have_protein.value = false;
    }
  });
};
const pdbCustomEvent = ({ id, name, pdb_string }) => {
  form.pdb_dataset_id = form.pdb_id = id;
  pdb_datalists(id).then(res => {
    form.pdb_id = res.data[0].inuse_path;
    form.pdb_name = res.data[0].file_name;
    pdb_ctx(res.data[0].inuse_path).then(data => {
      form.pdbid_select = "";
      form.pdbid_input = "";
      form.protein_data = "";
      const file = new Blob([data.data], { type: "text/plain" });
      if (pdb_string) {
        form.protein_file = new Blob([pdb_string], {
          type: "text/plain"
        });
        show_protein(pdb_string, "pdb");
      } else {
        form.protein_file = file;
        show_protein(data.data, "pdb");
      }
      if (name) {
        form.protein_data = name;
        protein_name.value = name;
      } else {
        form.protein_data = res[0].file_name;
        protein_name.value = res[0].file_name;
      }

      if_have_protein.value = true;
      get_basic_info();
    });
  });
};

onMounted(async () => {
  const res = await ossList({ proteins: "proteins", bucket: ossBucket, max_keys: 1 });
  if (res.success) {
    exampleList.value = res.objects.map(item => ({
      name: item.filename || item.Key,
      value: item.Key
    }));
    console.log(1113, exampleList);
  }
});
</script>

<template>
  <el-form ref="el_form_first" :model="form" class="flex-1 pl-[10px] pr-[20px]">
    <p class="label_1">输入蛋白</p>
    <el-form-item prop="input_tab" :rules="[{ required: true, message: 'This is required' }]">
      <el-radio-group v-model="form.input_tab">
        <el-radio-button label="数据库导入">数据库导入</el-radio-button>
        <el-radio-button label="上传文件">上传文件</el-radio-button>
        <el-radio-button label="数据中心">数据中心</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-if="form.input_tab === '数据库导入'"
      ref="pdbid_url_ref"
      prop="pdbid_url"
      :validate-status="form.pdbfile_validate_status"
      :rules="[
        { required: true, message: '请输入PDBID或者选择示例' },
        { validator: checkurl, trigger: 'change' }
      ]"
    >
      <el-input v-model="form.pdbid_input" placeholder="输入PDBID" class="w-full" @input="pdbidInput">
        <template #append>
          <el-select v-model="form.pdbid_select" placeholder="选择示例" class="w-[100px]!" @change="exampleChoose">
            <el-option v-for="item in exampleList" :key="item.value" :label="item.name" :value="item.value" />
          </el-select>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item v-if="form.input_tab === '上传文件'" prop="protein_file" :rules="[{ required: true, message: '请上传蛋白pdb文件', trigger: 'submit' }]">
      <CSupload inp_placeholder="上传" file_accept=".pdb" :is_slot="false" @uploadSuc="uploadSuc" />
    </el-form-item>
    <el-form-item v-if="form.input_tab === '数据中心'" :rules="[{ required: true, message: '请选择蛋白pdb文件', trigger: 'submit' }]" prop="protein_data">
      <el-button class="w-full w_100" @click="show_dialog('protein')">
        <el-input v-model="form.protein_data" :input-style="{ textAlign: 'center' }" class="w-full" style="width: 100%" placeholder="数据中心导入pdb" readonly />
      </el-button>
    </el-form-item>

    <p class="label_1">
      蛋白预处理
      <el-switch v-model="form.need_prot_process" class="ml-[10px]" />
    </p>
    <p class="label_3">如果您的蛋白已经做过蛋白预处理，您可以直接点击下一步。如果没有，建议您打开开关进行预处理相关的操作</p>
    <el-card v-show="form.need_prot_process" shadow="never" class="mt-[15px]" body-class=" l-[12px]">
      <p slot="label" class="label_1_1">选择需要保留的蛋白链</p>
      <el-form-item prop="box_ligand" :rules="[{ validator: check_box_ligand, trigger: 'change' }]">
        <p v-if="form.protein_chain.length == 0" class="no_data">暂无数据</p>
        <el-scrollbar v-else>
          <div v-for="item in form.protein_chain" :key="item.chain_id" class="flex">
            <el-checkbox v-model="item.if_checked" class="w-[25px] mr-0" @change="chain_change(item, item.if_checked)" />
            <span class="cursor-pointer" @click="chain_select_fn(item)">Chain {{ item.chain_id }}</span>
          </div>
        </el-scrollbar>
      </el-form-item>
      <p slot="label" class="label_1_1">选择需要保留的小分子及水分子</p>
      <p class="label_3 -mt-[5px]">此处默认展示pdb文件中所有的小分子及其5Å范围内的水分子，系统会默认删除5Å范围外的水，而5Å范围内的水由用户自行决定是否删除。其中具有水桥作用的水分子做了特殊标记，您可以通过【快速删除】按钮一步删除没有水桥作用的水分子</p>
      <el-form-item>
        <div class="flex items-start w-full">
          <el-scrollbar class="w-4/5">
            <div class="table_head">
              <span class="table_head_td w-[120px]">Het Name</span>
              <span class="table_head_td">Water(Within 5 Å)</span>
            </div>
            <div v-for="(item, ind) in form.het_group" v-if="form.het_group.length > 0" :key="item.name" class="table_body">
              <div class="table_body_td w-[120px]">
                <el-checkbox v-model="item.if_checked" class="w-[25px]" @change="het_change(item, item.if_checked)" />
                <span class="het_title" @click="het_select_fn(item)">{{ item.chain_id }}:{{ item.name }}</span>
              </div>
              <div class="table_body_td flex-1 overflow-auto whitespace-nowrap">
                <div v-for="(val, index) in item.water_within_dist" :key="index" class="inline-block">
                  <el-popover popper-class="water_popover" placement="bottom" trigger="hover">
                    <span @click="delete_single_het(ind, val, index)">删除</span>
                    <template #reference>
                      <span class="water_item" :class="{ red_str: val.if_water_bridge }" @click="single_het_click(val)">W</span>
                    </template>
                  </el-popover>
                </div>
              </div>
            </div>
            <div v-else class="empty_data">暂无数据</div>
          </el-scrollbar>
          <el-button class="ml-[10px]" type="primary" @click="quick_delete_click">快速删除</el-button>
        </div>
      </el-form-item>
      <p slot="label" class="label_1_1">优化蛋白</p>
      <el-form-item>
        <el-checkbox v-model="form.add_missing_residue" class="w-full">Add Missing Residue/Repair Faulty Structure</el-checkbox>
        <el-checkbox v-model="form.addh" class="w-full">Add Hydrogens</el-checkbox>
        <el-checkbox v-model="form.modify_protonation" class="w-full">
          Modify Protonation at pH:
          <el-input-number v-model="form.ph" :min="0" :max="14" :controls="false" :step="0.1" :step-strictly="true" class="w-16" />
        </el-checkbox>

        <el-checkbox v-model="form.opt_hydrogen" class="w-full">Optimize Hydrogen Bonding Network</el-checkbox>
        <el-checkbox v-model="form.energy_min" class="w-full">Energy Minimization</el-checkbox>
        <div v-if="form.energy_min" class="w-4/5">
          <span class="text-[#606266] mr-2">Forcefield:</span>
          <el-select v-model="form.force_field">
            <el-option v-for="item in charge_option" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
      </el-form-item>
    </el-card>
    <CSspinner ref="spinner_ref" />
    <Data_select v-model:if_show="show_data_list" :data_list="data_list" name="蛋白数据中心" @custom-event="handleCustomEvent" />
  </el-form>
</template>

<style lang="scss" scoped>
:deep(.el-tabs__item.is-disabled) {
  color: #333;
}
:deep(.el-upload-list) {
  margin: 0;
}
:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #606266;
}
:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #606266;
}
:deep(.el-input-number.is-without-controls .el-input__wrapper) {
  // padding-left: 4px;
  // padding-right: 4px;
}
:deep(.el-form-item__content > .w_100 > span) {
  width: 100%;
}
:deep(.el-form-item__content > .w_100) {
  padding: 0;
}
:deep(.el-button > span) {
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1rem;
}
:deep(.el-upload) {
  width: 100%;
}
.w_90 {
  width: 90%;
}
.el-form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0px;
  margin-top: 15px;
}
:deep(.el-form-item__label) {
  justify-content: flex-start;
}
:deep(.el-form-item__content) {
  margin-bottom: 0px;
}
.no_data {
  width: 100%;
  text-align: center;
  color: #909399;
}
.table_head {
  display: flex;
  align-items: center;
  border: 1px solid #ebeef5;
  .table_head_td {
    padding-left: 5px;
    padding-right: 5px;
    border-right: 1px solid #ebeef5;
  }
  .table_head_td:last-child {
    border-right: 0;
  }
}
.table_body {
  display: flex;
  align-items: center;
  border: 1px solid #ebeef5;
  border-top: 0;
  .table_body_td {
    border-right: 1px solid #ebeef5;
    padding-left: 5px;
    padding-right: 5px;
  }
  .table_body_td:last-child {
    border-right: 0;
  }
}
.water_item {
  padding: 2px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
}
.water_item:hover {
  border: 1px solid #5794ff;
}
.het_title {
  width: 95px;
  border-right: 1px solid #ebeef5;
  cursor: pointer;
  &:hover {
    color: #0160ee;
  }
}
.red_str {
  color: red;
}
.empty_data {
  color: #909399;
  text-align: center;
  border: 1px solid #ebeef5;
  border-top: 0;
}
</style>

<style lang="css">
.el-popover.water_popover {
  min-width: 60px !important;
  width: 60px !important;
  padding: 5px 0;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
</style>
