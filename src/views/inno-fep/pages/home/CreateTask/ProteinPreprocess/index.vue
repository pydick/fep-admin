<script setup lang="ts">
import Data_select from "../components/DataSelect/index.vue";
import { inject, ref, reactive, onMounted } from "vue";
import Upload from "./components/Upload/index.vue";
import CSspinner from "@/components/CSspinner/index.vue";
import { check_pdb_api, datalists, basic_info } from "@/api/data";
import { ossList, ossGetDownload, proteinInfo, componentsDelete, residueErrorFind, residueErrorFix, residueMissingFind, residueMissingFix } from "@/api/fep";
import { binaryToUploadFile } from "@/utils/common";
import { ElLoading, ElMessage } from "element-plus";
import BlockTitle from "@/views/inno-fep/components/BlcokTitle/index.vue";
import { clone } from "@pureadmin/utils";

import { debounce } from "@pureadmin/utils";
defineOptions({
  name: "ProteinPreprocess"
});
const protein3dRef = inject<any>("protein3dRef");

// 注入父组件提供的任务表单数据对象
const taskFormData = inject<any>("taskFormData");

const el_form_first = ref();
const if_have_protein = ref(false);
const if_chain = ref(false);
const spinner_ref = ref();
const pdbid_url_ref = ref();
const space = ref(null);

let exampleList = reactive<{ name: string; value: string }[]>([]);
const ossListCommomParams = { prefix: "proteins" };

const step1Form = reactive({
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
  // add_missing_residue: true,
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
  delete_water: [],
  disclose_file: "", //检测文件
  // 删除接口记录
  delete_record: {
    chains: [],
    hets: [],
    waters: [],
    irrelevant_waters: false
  }
});
taskFormData.step1Form = step1Form;

const if_show_box = ref(false);
const protein_content = ref([]);
const protein_ligand_content = ref([]);
const box_option = ref([]);
const box_ligand = ref("default");
const show_data_list = ref(false);
const dialog_type = ref("protein");
const data_list = ref([]);
const ligand_list = ref([]);
const preprocessingBtns = reactive({
  loading: false,
  text: "预处理",
  disabled: true
});
const charge_option = reactive([
  {
    key: 0,
    label: "AMBER99SB",
    value: "amber99sb",
    if_selected: true
  },
  {
    key: 5,
    label: "AMBER03",
    value: "amber03",
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

const show_dialog = async (type?: string) => {
  const res = await ossList({ ...ossListCommomParams });
  if (res.success) {
    data_list.value = res.data.objects.map(item => ({
      dataset_id: item.key,
      name: item.filename || item.key
    }));
    show_data_list.value = true;
  }
};
const handleCustomEvent = ({ id }) => {
  getPdbById(id);
};

const check_box_ligand = (rule, value, callback) => {
  if (step1Form.need_prot_process) {
    let check_chain = 0;
    step1Form.protein_chain.map(item => {
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
const show_protein = (file_or_pdbid, format = "pdb") => {
  if_show_box.value = false;
  step1Form.box_changed_by_user = false;
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
      formData.append("pdb", step1Form.protein_file);
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
  step1Form.box_ligand = "default";
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
    step1Form.box_ligand = box_option.value[max_ligand].value;
    box_ligand.value = box_option.value[max_ligand].value;
  }
};

const het_select_fn = data => {
  protein3dRef.value.select_and_focus(data);
};

const chain_change = async (data, value) => {
  await protein3dRef.value.change_chain(data.chain_id, value);
  draw_ligand_box_select(data.chain_id, value);
  if (value) {
    step1Form.delete_record.chains.splice(data.chain_id, 1);
    step1Form.delete_record.hets = step1Form.delete_record.hets.filter(item => item.chain_id !== data.chain_id).map(item => item.chain_id);
  } else {
    step1Form.delete_record.chains.push(data.chain_id);
    step1Form.delete_record.hets = [...step1Form.delete_record.hets, ...step1Form.het_group.filter(item => item.chain_id === data.chain_id).map(item => ({ chain_id: item.chain_id, residue_number: item.residue_number }))];
  }
  if (step1Form.protein_chain.every(item => item.if_checked === false)) {
    preprocessingBtns.disabled = true;
  } else {
    preprocessingBtns.disabled = false;
  }
  protein3dRef.value.select_none();
  const hets = [];
  for (let i = 0; i < step1Form.het_group.length; i++) {
    if (step1Form.het_group[i].chain_id === data.chain_id) {
      step1Form.het_group[i].if_checked = value;
      hets.push({ auth_asym_id: step1Form.het_group[i].chain_id, residue_number: step1Form.het_group[i].residue_number });
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

  if (step1Form.het_group.length == 0) return;
  step1Form.delete_record.waters = clone(step1Form.het_group).reduce((acc, item) => {
    item.water_within_dist.forEach(water => {
      acc.push({ residue_number: water.residue_number, chain_id: water.chain_id });
    });
    return acc;
  }, []);
  for (let i = 0; i < step1Form.het_group.length; i++) {
    step1Form.het_group[i].water_within_dist = step1Form.het_group[i].water_within_dist.filter(item => item.if_water_bridge == true);
  }
  step1Form.irrelevant_waters = true;
  step1Form.delete_record.irrelevant_waters = true;

  protein3dRef.value.select_none();

  for (let k = 0; k < water_dict_list.length; k++) {
    let flag = true;
    for (let i = 0; i < step1Form.het_group.length; i++) {
      const data = step1Form.het_group[i].water_within_dist;
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
  console.log(444, water_dict_list);
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
  step1Form.delete_water.push({ residue_number: val.residue_number, chain_id: val.chain_id });
  step1Form.het_group[ind].water_within_dist.splice(index, 1);
  protein3dRef.value.select_show_hide(val, false);
  step1Form.delete_record.waters.push({ residue_number: val.residue_number, chain_id: val.chain_id });
};

const single_het_click = data => {
  protein3dRef.value.select_and_focus(data);
};

const uploadSuc = (id, file) => {
  step1Form.disclose_file = file;
  getPdbById(id);
};
const pdbidInput = debounce(value => {
  const id = `proteins/${value}.pdb`;
  getPdbById(id);
}, 1000);

const het_change = async (data, value) => {
  console.log(555, data, value);
  protein3dRef.value.select_none();

  await protein3dRef.value.quick_select({ auth_asym_id: data.chain_id, residue_number: data.residue_number }, "single", true);

  if (value) {
    protein3dRef.value.show_selection("ligand");
    const hetIndex = step1Form.het_group.findIndex(item => item.chain_id === data.chain_id && item.residue_number === data.residue_number);
    if (hetIndex !== -1) {
      step1Form.het_group[hetIndex].water_within_dist.forEach(water => {
        water.disabled_by_ligand = false;
        // 从删除列表中移除这些水分子
        const waterIndex = step1Form.delete_water.findIndex(w => w.residue_number === water.residue_number && w.chain_id === water.chain_id);
        if (waterIndex !== -1) {
          step1Form.delete_water.splice(waterIndex, 1);
        }
      });
      step1Form.delete_record.hets = step1Form.delete_record.hets.filter(item => item.chain_id !== data.chain_id);
    }
  } else {
    protein3dRef.value.hide_selection();
    // 当配体被取消选择时，将其周围的水分子标记为不可用
    const hetIndex = step1Form.het_group.findIndex(item => item.chain_id === data.chain_id && item.residue_number === data.residue_number);
    if (hetIndex !== -1) {
      step1Form.het_group[hetIndex].water_within_dist.forEach(water => {
        water.disabled_by_ligand = true;
        // 自动将这些水分子添加到删除列表中
        const waterExists = step1Form.delete_water.some(w => w.residue_number === water.residue_number && w.chain_id === water.chain_id);
        if (!waterExists) {
          step1Form.delete_water.push({
            residue_number: water.residue_number,
            chain_id: water.chain_id
          });
        }
      });
      step1Form.delete_record.hets = [...step1Form.delete_record.hets, { residue_number: data.residue_number, chain_id: data.chain_id }];
    }
  }
};

const exampleChoose = async id => {
  await getPdbById(id);
};
const getPdbById = async id => {
  const loading = ElLoading.service({
    lock: true,
    text: "加载中",
    target: "#createTaskContainer"
  });
  try {
    const res = await ossGetDownload({ key: id, return_url: false });
    if (res.status === 200) {
      const filename = res.headers["content-disposition"].split("filename=")[1].replace(/"/g, "");
      show_protein(res.data, "pdb");
      const file = binaryToUploadFile(res.data, filename);
      const formData = new FormData();
      formData.append("file", file.raw);
      const proteinRes = await proteinInfo(formData);
      if (proteinRes.success) {
        step1Form.protein_chain = proteinRes.data.chains.map(item => ({ if_checked: true, ...item }));
        step1Form.het_group = proteinRes.data.hets.map(item => ({ if_checked: true, ...item }));
        step1Form.disclose_file = file.raw;
        preprocessingBtns.disabled = false;
      }
    }
  } finally {
    loading.close();
  }
};

onMounted(async () => {
  const res = await ossList({ ...ossListCommomParams, max_keys: 1 });
  if (res.success) {
    const exampleData = res.data.objects.map(item => ({
      name: item.filename || item.key.replace(/^.*\//, ""),
      value: item.key
    }));
    exampleList.push(...exampleData);
  }
});
const tab_list = reactive(["数据库导入", "上传文件", "数据中心"]);
const changeInputTab = value => {
  if (value !== tab_list[0]) {
    step1Form.pdbid_input = "";
    step1Form.pdbid_select = "";
    el_form_first.value.clearValidate("pdbid_input");
  }
};
const handlePreprocess = async () => {
  try {
    preprocessingBtns.loading = true;
    preprocessingBtns.text = "预处理中...";
    const formData = new FormData();
    formData.append("args", JSON.stringify(step1Form.delete_record));
    formData.append("pdb", step1Form.disclose_file);
    const componentsDeleteRes = await componentsDelete(formData);
    if (componentsDeleteRes.success) {
      const deleteFile = binaryToUploadFile(componentsDeleteRes.data.pdb_string).raw;
      const formdata = new FormData();
      formdata.append("pdb", deleteFile);
      const residueErrorFindRes = await residueErrorFind(formdata);
      console.log(residueErrorFindRes);
      if (residueErrorFindRes.success) {
        const errorsdata = residueErrorFindRes.data.errors;
        const formdata = new FormData();
        formdata.append("pdb", deleteFile);
        formdata.append("args", JSON.stringify(errorsdata));
        const residueErrorFixRes = await residueErrorFix(formdata);
        console.log(residueErrorFixRes);
        if (residueErrorFixRes.success) {
          const fixFile = binaryToUploadFile(residueErrorFixRes.data.pdb_string).raw;
          const formData = new FormData();
          formData.append("pdb", fixFile);
          const residueMissingFindRes = await residueMissingFind(formData);
          if (residueMissingFindRes.success) {
            const residue_missing = residueMissingFindRes.data.residue_missing;
            const formData = new FormData();
            formData.append("pdb", fixFile);
            formData.append("args", JSON.stringify({ residue_missing }));
            const residueMissingFixRes = await residueMissingFix(formData);
            if (residueMissingFixRes.success) {
              const pdb_string = residueMissingFixRes.data.pdb_string;
              const loading = ElLoading.service({
                lock: true,
                text: "加载中",
                target: "#createTaskContainer"
              });
              try {
                protein3dRef.value.loadStructure(pdb_string, "pdb");
                const fixFile2 = binaryToUploadFile(pdb_string).raw;
                const formData = new FormData();
                formData.append("file", fixFile2);
                const proteinRes = await proteinInfo(formData);
                if (proteinRes.success) {
                  step1Form.protein_chain = proteinRes.data.chains.map(item => ({ if_checked: true, ...item }));
                  step1Form.het_group = proteinRes.data.hets.map(item => ({ if_checked: true, ...item }));
                  step1Form.disclose_file = fixFile2;
                }
              } finally {
                loading.close();
              }
            } else {
              ElMessage.error(residueMissingFixRes.message);
            }
          } else {
            ElMessage.error(residueMissingFindRes.message);
          }
        } else {
          ElMessage.error(residueErrorFixRes.message);
        }
      } else {
        ElMessage.error(residueErrorFindRes.message);
      }
    } else {
      ElMessage.error(componentsDeleteRes.message);
    }
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    preprocessingBtns.text = "重新处理";
    preprocessingBtns.loading = false;
  }
};
</script>

<template>
  <el-form ref="el_form_first" :model="step1Form" class="flex-1">
    <div class="">
      <blockTitle title="输入蛋白" class="pb-[15px]" />
      <el-card shadow="never">
        <el-form-item prop="input_tab" class="pt-0!" :rules="[{ required: true, message: 'This is required' }]">
          <el-radio-group v-model="step1Form.input_tab" @change="changeInputTab">
            <el-radio-button v-for="item in tab_list" :key="item" :label="item">{{ item }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-show="step1Form.input_tab === '数据库导入'" class="dbid_input_box">
          <el-form-item ref="pdbid_url_ref" prop="pdbid_input" :rules="[{ required: true, message: '请输入PDBID或者选择示例', trigger: 'change' }]">
            <el-input v-model="step1Form.pdbid_input" placeholder="输入PDBID" class="pdbid_input" @change="pdbidInput" />
          </el-form-item>
          <el-form-item prop="pdbid_select" class="w-[120px]!">
            <el-select v-model="step1Form.pdbid_select" placeholder="选择示例" @change="exampleChoose">
              <el-option v-for="item in exampleList" :key="item.value" :label="item.name" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div v-show="step1Form.input_tab === '上传文件'" class="">
          <el-form-item prop="protein_file" :rules="[{ required: true, message: '请上传蛋白pdb文件', trigger: 'submit' }]">
            <Upload inp_placeholder="上传" file_accept=".pdb" :is_slot="false" @uploadSuc="uploadSuc" />
          </el-form-item>
        </div>
        <div v-show="step1Form.input_tab === '数据中心'" class="">
          <el-form-item :rules="[{ required: true, message: '请选择蛋白pdb文件', trigger: 'submit' }]" prop="protein_data">
            <el-button class="w-full w_100" @click="show_dialog('protein')">
              <el-input v-model="step1Form.protein_data" :input-style="{ textAlign: 'center' }" class="w-full!" placeholder="数据中心导入pdb" readonly />
            </el-button>
          </el-form-item>
        </div>
      </el-card>
    </div>

    <div class="">
      <blockTitle title="蛋白预处理">
        <el-switch v-model="step1Form.need_prot_process" class="ml-[10px]" />
      </blockTitle>
      <p class="label_3 pb-[15px]">如果您的蛋白已经做过蛋白预处理，您可以直接点击下一步。如果没有，建议您打开开关进行预处理相关的操作</p>
      <el-card v-show="step1Form.need_prot_process" shadow="never" body-class="py-0!">
        <p slot="label" class="label_1_1">选择需要保留的蛋白链</p>
        <el-form-item prop="box_ligand" class="mt-0!" :rules="[{ validator: check_box_ligand, trigger: 'change' }]">
          <p v-if="step1Form.protein_chain.length == 0" class="no_data">暂无数据</p>
          <el-scrollbar v-else>
            <div v-for="item in step1Form.protein_chain" :key="item.chain_id" class="flex">
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
              <div v-for="(item, ind) in step1Form.het_group" v-if="step1Form.het_group.length > 0" :key="item.name" class="table_body">
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
            <el-button class="ml-[10px]!" type="primary" @click="quick_delete_click">快速删除</el-button>
          </div>
        </el-form-item>
        <p slot="label" class="label_1_1">优化蛋白</p>
        <el-form-item>
          <!-- <el-checkbox v-model="step1Form.add_missing_residue" class="w-full">Add Missing Residue/Repair Faulty Structure</el-checkbox> -->
          <el-checkbox v-model="step1Form.addh" class="w-full">Add Hydrogens</el-checkbox>
          <el-checkbox v-model="step1Form.modify_protonation" class="w-full">
            Modify Protonation at pH:
            <el-input-number v-model="step1Form.ph" :min="0" :max="14" :controls="false" :step="0.1" :step-strictly="true" class="w-16" />
          </el-checkbox>

          <el-checkbox v-model="step1Form.opt_hydrogen" class="w-full">Optimize Hydrogen Bonding Network</el-checkbox>
          <el-checkbox v-model="step1Form.energy_min" class="w-full">Energy Minimization</el-checkbox>
          <div v-if="step1Form.energy_min" class="w-full pb-[15px]">
            <span class="text-[#606266] mr-2">Forcefield:</span>
            <el-select v-model="step1Form.force_field" class="w-[200px]! inline-block mr-[10px]">
              <el-option v-for="item in charge_option" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button class="ml-[10px]" type="primary" :loading="preprocessingBtns.loading" :disabled="preprocessingBtns.disabled" @click="handlePreprocess">{{ preprocessingBtns.text }}</el-button>
          </div>
        </el-form-item>
      </el-card>
    </div>
    <CSspinner ref="spinner_ref" />
    <Data_select v-model:if_show="show_data_list" :data_list="data_list" name="蛋白数据中心" @custom-event="handleCustomEvent" />
  </el-form>
</template>

<style lang="scss" scoped>
.dbid_input_box {
  display: flex;
  & > .el-form-item:first-child {
    flex: 1;
  }
}

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
  padding-top: 15px;
  // margin-top: 15px;
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
  margin: 0;
  height: 40px;
  line-height: 40px;
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
  height: 40px;
  line-height: 40px;
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
