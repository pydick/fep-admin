<script setup lang="ts">
import BlcokTitle from "@/views/inno-fep/components/BlcokTitle/index.vue";
import { ref, reactive, onMounted, inject, watch, computed, nextTick } from "vue";
import LiTable from "./components/LiTable/index.vue";
import Upload from "./components/Upload/index.vue";
import PerturbationGraphDialog from "./components/PerGraphDialog/index.vue";
import Data_select from "../components/DataSelect/index.vue";
import { ossList, selectLigandExample, alignLigand, prepareLigand, appendMolecules, validateLigand, renameMolecule } from "@/api/fep";
import { ElMessage, ElLoading } from "element-plus";
import { mockrow1, mockrow2, mockrow3 } from "@/views/inno-fep/pages/home/mockdata/otherdata.js";
import { distribute_data } from "@/views/inno-fep/pages/home/mockdata/table_getdata_distribute.js";
import { useTaskStoreHook } from "@/store/modules/task";
const ligand3dData = inject<any>("ligandData");
const centerMolecule = inject<any>("centerMolecule");
const taskStore = useTaskStoreHook();
const data_list = ref([]);
defineOptions({
  name: "LigandPreprocess"
});

interface IProps {
  step2Disalbed?: boolean;
}
const props = withDefaults(defineProps<IProps>(), {
  step2Disalbed: true
});
const emit = defineEmits<{
  (e: "update:step2Disalbed", value: boolean): void;
}>();

const innerStep2Disalbed = computed({
  get: () => props.step2Disalbed,
  set: (value: boolean) => {
    emit("update:step2Disalbed", value);
  }
});

defineExpose({
  clearData: () => clearData()
});

const clearData = () => {
  ligandList.value = [];
  Object.assign(step2Form, {
    ...step2FormInitialValues,
    referenceLigand: ligand3dData.value.ligand_number
  });
  uploadTextVal.value = uploadTextDefaultVal;
  dataCenterTextValue.value = dataCenterTextdefaultValue;
};

const num_poses = ref(distribute_data.args.docking.num_poses);

const preprocess_data = data => {
  const ret_list = [];
  for (let i = 0; i < data.results.length; i++) {
    const ret_dict = {};
    if (JSON.stringify(data.results[i]) !== "{}") {
      ret_dict.SMILES = data.results[i].SMILES;
      ret_dict._id = data.results[i].id;
      ret_dict.row_id = i;
      ret_dict.raw_data = data.results[i].raw_data;
      ret_dict.id = data.results[i].values._id;
      ret_dict.iso_id = data.results[i].values._iso_id ? data.results[i].values._iso_id : "-";
      ret_dict.ori_id = data.results[i].values._ori_id ? data.results[i].values._ori_id : "-";
      ret_dict.show_id = data.results[i].values._show_id ? data.results[i].values._show_id : data.results[i].values._res_idx ? data.results[i].values._res_idx : "-";
      ret_dict.key = data.results[i].values._id * num_poses.value + data.results[i].values._ori_id;
      ret_dict.values = data.results[i].values;
      ret_dict.weight = data.results[i].weight;
      ret_dict.finished = data.results[i].finished;
      // ret_dict.affinity = Math.round(data.results[i].values['Vina Score'] * 1000) / 1000
      Object.keys(data.results[i].values).forEach(key => {
        if (key !== "IGN" && key !== "RTMS" && key !== "Residues" && key !== "residues" && key !== "residues_full_info" && key !== "_id" && key !== "_iso_id" && key !== "_ori_id" && key !== "_res_idx" && key !== "_show_id") {
          ret_dict.affinity = isNaN(data.results[i].values[key]) ? data.results[i].values[key] : Math.round(data.results[i].values[key] * 1000) / 1000;
          // ret_dict.affinity = Math.round(data.results[i].values[key] * 1000) / 1000
        }
      });
      ret_dict.IGN = data.results[i].values.IGN === undefined ? data.results[i].values.IGN : Math.round(data.results[i].values.IGN * 1000) / 1000;

      ret_dict.RTMS = data.results[i].values.RTMScore === undefined ? data.results[i].values.RTMScore : Math.round(data.results[i].values.RTMScore * 1000) / 1000;

      ret_dict.score = data.results[i].values.score === undefined ? data.results[i].values.score : Math.round(data.results[i].values.score * 1000) / 1000;
    }
    ret_list.push(ret_dict);
  }
  data.results = ret_list;
  return data;
};

// 注入父组件提供的任务表单数据对象
const taskFormData = inject<any>("taskFormData");

const ossListCommomParams = { prefix: "ligands" };

const step2FormInitialValues = {
  ligandId: "",
  example: "",
  ligandData: "",
  showLigandOverlay: false,
  showExperimentData: false,
  experimentMethod: "IC50",
  experimentUnit: "nM",
  mapType: "Star map",
  centerMolecule: ""
};

const el_form_second = ref();
const step2Form = reactive({
  ...step2FormInitialValues,
  referenceLigand: ligand3dData.value.ligand_number
});
const mapTypesEnum = [
  { label: "Star map", value: "Star map" },
  { label: "OPtimal map", value: "OPtimal map" }
];
centerMolecule.value.hasCenterMolecule = step2Form.mapType === mapTypesEnum[0].value;
const showDataCenter = ref(false);

taskFormData.step2Form = step2Form;

const centralMoleculeOptions = computed(() => {
  return ligandList.value.map(item => ({
    label: item.name,
    value: item.id
  }));
});

const referenceLigand = computed(() => {
  const options = [
    {
      label: ligand3dData.value.ligand_name,
      value: ligand3dData.value.ligand_number
    }
  ];
  options.push(
    ...ligandList.value.map(item => ({
      label: item.name,
      value: item.id
    }))
  );
  return options;
});

let ligandList = ref([]);

const experimentMethods = ref([
  { label: "IC50", value: "IC50" },
  { label: "Ki", value: "Ki" },
  { label: "Kd", value: "Kd" }
]);

const experimentUnits = ref([
  { label: "nM", value: "nM" },
  { label: "μM", value: "μM" },
  { label: "mM", value: "mM" },
  { label: "M", value: "M" },
  { label: "kcal/mol", value: "kcal/mol" }
]);

const mapTypes = ref([...mapTypesEnum]);

const tab_list = ref<string[]>(["本地文件", "数据中心"]);
const tab = ref<string>(tab_list.value[0]);
const changeInputTab = value => {
  console.log(value);
};

const exampleChoose = async value => {
  console.log(value);
  const res = await selectLigandExample({ oss_key: value });
  if (res.success) {
    ligandList.value = mockLigandData(res.data.molecules);
  }
};

const liTableRef = ref();
const isAlign = ref(false);

const handleAlign = async () => {
  isAlign.value = true;
  liTableRef.value.toggleAllSelection();
  // const formData = new FormData();
  // formData.append("task_id", taskStore.taskId);
  // formData.append("number", "123");
  // const res = await alignLigand(formData);
  // if (res.success) {
  //   ElMessage.success("叠合成功");
  //   isAlign.value = true;
  //   liTableRef.value.toggleAllSelection();
  // } else {
  //   ElMessage.error("叠合失败");
  // }
};

const isGernerate = ref(false);

const handleGenerateMap = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: "加载中",
    target: "#createTaskContainer"
  });
  try {
    const formData = new FormData();
    formData.append("task_id", taskStore.taskId);
    const validateRes = await validateLigand(formData);
    if (validateRes.success) {
      const params = {
        task_id: taskStore.taskId,
        step: 1,
        use_user_defined_map_flag: false,
        user_pair_list: []
      };
      const res = await prepareLigand(params);
      if (res.success) {
        isGernerate.value = true;
        innerStep2Disalbed.value = false;
      } else {
        ElMessage.error(res.message);
      }
    } else {
      ElMessage.error(validateRes.message);
    }
  } finally {
    loading.close();
  }
};
const addUploadRef = ref();
const addNewLigand = () => {
  console.log("添加新分子", addUploadRef.value);
  addUploadRef.value.triggerClick();
};

const perturbationGraphVisible = ref(false);
const perturbationGraphShow = () => {
  if (step2Form.mapType === mapTypesEnum[0].value && !step2Form.centerMolecule) {
    ElMessage.error("请先选择映射图方式为Star map，并选择中心分子");
    return;
  }
  perturbationGraphVisible.value = true;
};

const uploadTextDefaultVal = "上传";

const uploadTextVal = ref(uploadTextDefaultVal);

const uploadSuc = (data, filename) => {
  uploadTextVal.value = filename;
  ligandList.value = data.molecules;
  // ligandList.value = mockLigandData(data.molecules);
};

const addNewLigandSuc = data => {
  ligandList.value = data.molecules;
  // ligandList.value = mockLigandData(ligandList.value);
};

const mockLigandData = data => {
  const data1 = data.map((item, index) => {
    let ligandData = {};
    if (index === 0) {
      ligandData = mockrow1;
    } else if (index === 1) {
      ligandData = mockrow2;
    } else if (index === 2) {
      ligandData = mockrow3;
    }
    return {
      ...item,
      ligandData: ligandData
    };
  });
  const data2 = data1.map(item => item.ligandData);
  const data3 = preprocess_data({ results: data2 });
  const data4 = data1.map((item, index) => {
    if (index === 0) {
      item.ligandData = data3.results[index];
    } else if (index === 1) {
      item.ligandData = data3.results[index];
    } else if (index === 2) {
      item.ligandData = data3.results[index];
    } else {
      item.ligandData = {};
    }
    return item;
  });
  return data4;
};

let exampleList = reactive<{ name: string; value: string }[]>([]);

const buildDisabled = computed(() => {
  console.log(liTableRef.value);
  const len = ligandList.value.length;
  console.log(len);
  if (len < 2) {
    return true;
  } else {
    if (isAlign.value || !step2Form.showLigandOverlay) {
      return false;
    }
    return true;
  }
});

const sucessSure = async ({ id, name }) => {
  dataCenterTextValue.value = name;
  const res = await selectLigandExample({ oss_key: id });
  if (res.success) {
    // ligandList.value = mockLigandData(res.data.molecules);
    ligandList.value = res.data.molecules;
  }
};

const handleNameChange = async row => {
  const params = {
    task_id: taskStore.taskId,
    molecule_index: row.id,
    new_name: row.name
  };
  const res = await renameMolecule(params);
  if (res.success) {
    ligandList.value = res.data.molecules;
  } else {
    ElMessage.error(res.message);
  }
};

const dataCenterTextdefaultValue = "数据中心导入ligand";

const dataCenterTextValue = ref(dataCenterTextdefaultValue);

const show_dialog = async () => {
  const res = await ossList({ ...ossListCommomParams });
  if (res.success) {
    data_list.value = res.data.objects.map(item => ({
      dataset_id: item.key,
      name: item.filename || item.key
    }));
    showDataCenter.value = true;
  }
};

const handleMapTypeChange = value => {
  if (value === mapTypesEnum[0].value) {
    centerMolecule.value.hasCenterMolecule = true;
  } else {
    centerMolecule.value.hasCenterMolecule = false;
  }
};
const handleCenterMoleculeChange = value => {
  centerMolecule.value.data = {
    name: centralMoleculeOptions.value.find(item => item.value === value)?.label
  };
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
</script>

<template>
  <el-form ref="el_form_second" :model="step2Form" label-position="right" label-width="100px" class="flex-1">
    <BlcokTitle title="上传分子" class="pb-[15px]" />
    <el-card shadow="never">
      <el-radio-group v-model="tab" class="" @change="changeInputTab">
        <el-radio-button v-for="item in tab_list" :key="item" :label="item">{{ item }}</el-radio-button>
      </el-radio-group>
      <div v-show="tab === tab_list[0]" class="dbid_input_box">
        <el-form-item ref="pdbid_url_ref" label-width="0px" prop="ligandId">
          <Upload :inp_placeholder="uploadTextVal" file_accept=".csv,.sdf" :is_slot="false" @uploadSuc="uploadSuc" />
        </el-form-item>
        <el-form-item prop="pdbid_select" label-width="0px" class="w-[120px]!">
          <el-select v-model="step2Form.example" placeholder="选择示例" @change="exampleChoose">
            <el-option v-for="item in exampleList" :key="item.value" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
        <div class="pt-[15px] inline-block ml-[15px] relative">
          <el-button type="primary" @click="addNewLigand()">添加新分子</el-button>
          <Upload ref="addUploadRef" class="add-upload" inp_placeholder="上传" uploadType="append" :taskId="taskStore.taskId" file_accept=".csv,.sdf" :is_slot="false" @uploadSuc="addNewLigandSuc" />
        </div>
      </div>
      <div v-show="tab === tab_list[1]" class="w-full dbid_input_box">
        <el-form-item label-width="0px" :rules="[{ required: true, message: '请选择蛋白pdb文件', trigger: 'submit' }]" prop="ligandData">
          <el-button class="w-full w_100" @click="show_dialog()">
            <el-input v-model="step2Form.ligandData" :input-style="{ textAlign: 'center' }" class="w-full" :placeholder="dataCenterTextValue" readonly />
          </el-button>
        </el-form-item>
        <div class="pt-[15px] inline-block ml-[15px] relative">
          <el-button type="primary" @click="addNewLigand()">添加新分子</el-button>
          <Upload ref="addUploadRef" class="add-upload" inp_placeholder="上传" uploadType="append" :taskId="taskStore.taskId" file_accept=".csv,.sdf" :is_slot="false" @uploadSuc="addNewLigandSuc" />
        </div>
      </div>
    </el-card>
    <BlcokTitle title="配体列表" />
    <LiTable ref="liTableRef" v-model:data="ligandList" class="mt-[15px]" @nameChange="handleNameChange" />

    <BlcokTitle title="分子叠合">
      <el-switch v-model="step2Form.showLigandOverlay" class="ml-[10px]" />
    </BlcokTitle>
    <div v-show="step2Form.showLigandOverlay" class="overlay-section">
      <el-form-item label="参考配体" prop="referenceLigand">
        <el-select v-model="step2Form.referenceLigand" placeholder="选择参考配体" class="w-[200px]! inline-block mr-[10px]">
          <el-option v-for="item in referenceLigand" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" :disabled="ligandList.length < 2" @click="handleAlign">Align</el-button>
        <el-tooltip content="基于左侧3D区域选择的参考配体，进行分子叠合。至少有两个配体被选中，才能进行分子叠合。" placement="top">
          <el-icon class="ml-[5px] icon-common"><QuestionFilled /></el-icon>
        </el-tooltip>
      </el-form-item>
    </div>

    <BlcokTitle title="实验数据" class="mt-[15px]">
      <el-switch v-model="step2Form.showExperimentData" class="ml-[10px]" />
    </BlcokTitle>
    <div v-show="step2Form.showExperimentData" class="flex">
      <el-form-item label="实验亲和力" prop="experimentMethod">
        <el-select v-model="step2Form.experimentMethod" placeholder="选择实验亲和力" class="select-w-responsive mr-[15px]">
          <el-option v-for="item in experimentMethods" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="亲和力单位" prop="experimentUnit" label-width="90px">
        <el-select v-model="step2Form.experimentUnit" placeholder="选择亲和力单位" class="select-w-responsive">
          <el-option v-for="item in experimentUnits" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
    </div>

    <BlcokTitle title="创建映射图" class="mt-[15px]" />
    <div class="map-section flex flex-wrap">
      <el-form-item label="映射图方式" prop="mapType" label-position="right">
        <el-select v-model="step2Form.mapType" placeholder="选择映射图方式" class="select-w-responsive mr-[15px]" @change="handleMapTypeChange">
          <el-option v-for="item in mapTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="step2Form.mapType === mapTypes[0].value" label="中心分子" prop="centerMolecule" label-position="right" label-width="70px">
        <el-select v-model="step2Form.centerMolecule" placeholder="选择中心分子" class="select-w-responsive mr-[10px]" @change="handleCenterMoleculeChange">
          <el-option v-for="item in centralMoleculeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <div class="pt-[15px] xl:pl-[100PX] 2xl:pl-0 flex-bc">
        <el-button type="primary" :disabled="buildDisabled" @click="handleGenerateMap">Build</el-button>
        <el-tooltip content="至少两个配体以上， Align后或者关闭分子叠合，才能使用Build" placement="top">
          <el-icon class="ml-[5px] icon-common mr-[15px]"><QuestionFilled /></el-icon>
        </el-tooltip>
        <el-button type="primary" :disabled="!isGernerate" @click="perturbationGraphShow">配体微扰图</el-button>
        <el-tooltip content="Build后，才能生成并打开配体微扰图" placement="top">
          <el-icon class="ml-[5px] icon-common"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <PerturbationGraphDialog v-if="perturbationGraphVisible" v-model:visible="perturbationGraphVisible" />
    <Data_select v-model:if_show="showDataCenter" :data_list="data_list" name="配体数据中心" @custom-event="sucessSure" />
  </el-form>
</template>

<style lang="scss" scoped>
.dbid_input_box {
  display: flex;

  & > .el-form-item:first-child {
    flex: 1;
  }
}
:deep(.el-upload) {
  width: 100%;
}
:deep(.el-form-item__content > .w_100 > span) {
  width: 100%;
}
:deep(.el-form-item__content > .w_100) {
  padding: 0;
}

.el-form-item {
  margin-bottom: 0px;
  margin-top: 15px;
}
.add-upload {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  visibility: hidden;
}
</style>
