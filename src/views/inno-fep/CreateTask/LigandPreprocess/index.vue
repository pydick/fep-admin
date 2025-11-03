<script setup lang="ts">
import BlcokTitle from "../../components/BlcokTitle/index.vue";
import { ref, reactive, onMounted, inject } from "vue";
import LiTable from "./components/LiTable/index.vue";
import Upload from "./components/Upload/index.vue";
import PerturbationGraphDialog from "./components/PerGraphDialog/index.vue";
import Data_select from "../components/DataSelect/index.vue";
import { ossList } from "@/api/fep";
const data_list = ref([]);
defineOptions({
  name: "LigandPreprocess"
});

// 注入父组件提供的任务表单数据对象
const taskFormData = inject<any>("taskFormData");

const ossListCommomParams = { prefix: "ligands" };

const el_form_second = ref();
const step2Form = reactive({
  ligandId: "",
  example: "",
  ligandData: "",
  showLigandOverlay: true,
  showExperimentData: true,
  referenceLigand: "cpd1",
  experimentMethod: "IC50",
  experimentUnit: "nM",
  mapType: "Star map",
  centerMolecule: "cpd1"
});
const showDataCenter = ref(false);

taskFormData.step2Form = step2Form;

const referenceLigand = reactive([
  {
    label: "cpd1",
    value: "cpd1"
  },
  {
    label: "cpd2",
    value: "cpd2"
  },
  {
    label: "cpd3",
    value: "cpd3"
  }
]);
let ligandList = reactive([]);

const experimentMethods = ref([
  { label: "IC50", value: "IC50" },
  { label: "Ki", value: "Ki" },
  { label: "Kd", value: "Kd" }
]);

const experimentUnits = ref([
  { label: "nM", value: "nM" },
  { label: "μM", value: "μM" },
  { label: "mM", value: "mM" }
]);

const mapTypes = ref([
  { label: "Star map", value: "Star map" },
  { label: "Circle map", value: "Circle map" },
  { label: "Tree map", value: "Tree map" }
]);

const tab_list = ref<string[]>(["本地文件", "数据中心"]);
const tab = ref<string>(tab_list.value[0]);
const changeInputTab = value => {
  console.log(value);
};
const ligandIdChange = value => {
  console.log(value);
};
const exampleChoose = value => {
  console.log(value);
};

const show_dialog = async (type?: string) => {
  const res = await ossList({ ...ossListCommomParams });
  if (res.success) {
    data_list.value = res.data.objects.map(item => ({
      dataset_id: item.key,
      name: item.filename || item.key
    }));
    showDataCenter.value = true;
  }
};

const handleAlign = () => {
  console.log("执行分子叠合");
};

const handleGenerateMap = () => {
  console.log("生成映射图");
};
const addUploadRef = ref();
const addNewLigand = () => {
  console.log("添加新分子", addUploadRef.value);
  addUploadRef.value.triggerClick();
};

const perturbationGraphVisible = ref(false);
const perturbationGraphShow = () => {
  perturbationGraphVisible.value = true;
};
const uploadSuc = data => {
  ligandList.length = 0;
  ligandList.push(...data.molecules);
};

const addNewLigandSuc = data => {
  ligandList.push(...data.molecules);
};

let exampleList = reactive<{ name: string; value: string }[]>([]);

const sucessSure = ({ id }) => {
  console.log(id);
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
          <Upload inp_placeholder="上传" file_accept=".csv,.sdf" :is_slot="false" @uploadSuc="uploadSuc" />
        </el-form-item>
        <el-form-item prop="pdbid_select" label-width="0px" class="w-[120px]!">
          <el-select v-model="step2Form.example" placeholder="选择示例" @change="exampleChoose">
            <el-option v-for="item in exampleList" :key="item.value" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
        <div class="pt-[15px] inline-block ml-[15px] relative">
          <el-button type="primary" @click="addNewLigand()">添加新分子</el-button>
          <Upload ref="addUploadRef" class="add-upload" inp_placeholder="上传" file_accept=".csv,.sdf" :is_slot="false" @uploadSuc="addNewLigandSuc" />
        </div>
      </div>
      <div v-show="tab === tab_list[1]" class="w-full">
        <el-form-item label-width="0px" :rules="[{ required: true, message: '请选择蛋白pdb文件', trigger: 'submit' }]" prop="ligandData">
          <el-button class="w-full w_100" @click="show_dialog()">
            <el-input v-model="step2Form.ligandData" :input-style="{ textAlign: 'center' }" class="w-full" placeholder="数据中心导入ligand" readonly />
          </el-button>
        </el-form-item>
      </div>
    </el-card>
    <BlcokTitle title="配体列表" />
    <LiTable v-model:data="ligandList" class="mt-[15px]" />

    <BlcokTitle title="分子叠合">
      <el-switch v-model="step2Form.showLigandOverlay" class="ml-[10px]" />
    </BlcokTitle>
    <div v-show="step2Form.showLigandOverlay" class="overlay-section">
      <el-form-item label="参考配体" prop="referenceLigand">
        <el-select v-model="step2Form.referenceLigand" placeholder="选择参考配体" class="w-[200px]! inline-block mr-[10px]">
          <el-option v-for="item in referenceLigand" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleAlign">Align</el-button>
      </el-form-item>
    </div>

    <BlcokTitle title="实验数据" class="mt-[15px]">
      <el-switch v-model="step2Form.showExperimentData" class="ml-[10px]" />
    </BlcokTitle>
    <div v-show="step2Form.showExperimentData" class="flex">
      <el-form-item label="实验数据方式" prop="experimentMethod">
        <el-select v-model="step2Form.experimentMethod" placeholder="选择实验数据方式" class="select-w-responsive mr-[15px]">
          <el-option v-for="item in experimentMethods" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="实验能力" prop="experimentUnit" label-width="70px">
        <el-select v-model="step2Form.experimentUnit" placeholder="选择实验能力单位" class="select-w-responsive">
          <el-option v-for="item in experimentUnits" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
    </div>

    <BlcokTitle title="创建映射图" class="mt-[15px]" />
    <div class="map-section flex flex-wrap">
      <el-form-item label="映射图方式" prop="mapType" label-position="right">
        <el-select v-model="step2Form.mapType" placeholder="选择映射图方式" class="select-w-responsive mr-[15px]">
          <el-option v-for="item in mapTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="中心分子" prop="centerMolecule" label-position="right" label-width="70px">
        <el-select v-model="step2Form.centerMolecule" placeholder="选择中心分子" class="select-w-responsive mr-[10px]">
          <el-option v-for="item in referenceLigand" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <div class="pt-[15px] xl:pl-[100PX] 2xl:pl-0">
        <el-button type="primary" @click="handleGenerateMap">生成</el-button>
        <el-button @click="perturbationGraphShow">配体微扰图</el-button>
      </div>
    </div>
    <PerturbationGraphDialog v-model:visible="perturbationGraphVisible" />
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
