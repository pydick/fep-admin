<script setup lang="ts">
import BlcokTitle from "../../components/BlcokTitle/index.vue";
import { ref, reactive, onMounted } from "vue";
import LiTable from "./LiTable/index.vue";
import CSupload from "@/components/CSupload/index.vue";
import PerturbationGraphDialog from "./PerGraphDialog/index.vue";
import { ossList } from "@/api/fep";
defineOptions({
  name: "LigandPreprocess"
});
const el_form_second = ref();
const form = reactive({
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

const show_dialog = value => {
  console.log("show_dialog");
};

const handleAlign = () => {
  console.log("执行分子叠合");
};

const handleGenerateMap = () => {
  console.log("生成映射图");
};

const perturbationGraphVisible = ref(true);
const perturbationGraphShow = () => {
  perturbationGraphVisible.value = true;
  console.log(111, perturbationGraphVisible.value);
};
const uploadSuc = value => {
  console.log(value);
};

let exampleList = reactive<{ name: string; value: string }[]>([]);

onMounted(async () => {
  const res = await ossList({ proteins: "proteins", max_keys: 1 });
  if (res.success) {
    const exampleData = res.data.objects.map(item => ({
      name: item.filename || item.key.replace(/^.*\//, ""),
      value: item.key
    }));
    Object.assign(exampleList, exampleData);
  }
});
</script>

<template>
  <el-form ref="el_form_second" :model="form" label-position="right" label-width="100px" class="flex-1">
    <BlcokTitle title="上传分子" class="pb-[15px]" />
    <el-card shadow="never">
      <el-radio-group v-model="tab" class="" @change="changeInputTab">
        <el-radio-button v-for="item in tab_list" :key="item" :label="item">{{ item }}</el-radio-button>
      </el-radio-group>
      <div v-show="tab === tab_list[0]" class="dbid_input_box">
        <el-form-item ref="pdbid_url_ref" label-width="0px" prop="ligandId">
          <CSupload inp_placeholder="上传" file_accept=".csv/sdf" :is_slot="false" @uploadSuc="uploadSuc" />
        </el-form-item>
        <el-form-item prop="pdbid_select" label-width="0px" class="w-[120px]!">
          <el-select v-model="form.example" placeholder="选择示例" @change="exampleChoose">
            <el-option v-for="item in exampleList" :key="item.value" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
      </div>
      <div v-show="tab === tab_list[1]" class="w-full">
        <el-form-item label-width="0px" :rules="[{ required: true, message: '请选择蛋白pdb文件', trigger: 'submit' }]" prop="ligandData">
          <el-button class="w-full w_100" @click="show_dialog('protein')">
            <el-input v-model="form.ligandData" :input-style="{ textAlign: 'center' }" class="w-full" placeholder="数据中心导入pdb" readonly />
          </el-button>
        </el-form-item>
      </div>
    </el-card>
    <BlcokTitle title="配体列表" />
    <LiTable class="mt-[15px]" />

    <BlcokTitle title="分子叠合">
      <el-switch v-model="form.showLigandOverlay" class="ml-[10px]" />
    </BlcokTitle>
    <div v-show="form.showLigandOverlay" class="overlay-section">
      <el-form-item label="参考配体" prop="referenceLigand">
        <el-select v-model="form.referenceLigand" placeholder="选择参考配体" class="w-[200px]! inline-block mr-[10px]">
          <el-option v-for="item in referenceLigand" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleAlign">Align</el-button>
      </el-form-item>
    </div>

    <BlcokTitle title="实验数据" class="mt-[15px]">
      <el-switch v-model="form.showExperimentData" class="ml-[10px]" />
    </BlcokTitle>
    <div v-show="form.showExperimentData" class="flex">
      <el-form-item label="实验数据方式" prop="experimentMethod">
        <el-select v-model="form.experimentMethod" placeholder="选择实验数据方式" class="w-[200px]! mr-[15px]">
          <el-option v-for="item in experimentMethods" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="实验能力" prop="experimentUnit" label-width="70px">
        <el-select v-model="form.experimentUnit" placeholder="选择实验能力单位" class="w-[200px]!">
          <el-option v-for="item in experimentUnits" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
    </div>

    <BlcokTitle title="创建映射图" class="mt-[15px]" />
    <div class="map-section flex">
      <el-form-item label="映射图方式" prop="mapType" label-position="right">
        <el-select v-model="form.mapType" placeholder="选择映射图方式" class="w-[200px]! mr-[15px]">
          <el-option v-for="item in mapTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="中心分子" prop="centerMolecule" label-position="right" label-width="70px">
        <el-select v-model="form.centerMolecule" placeholder="选择中心分子" class="w-[200px]! mr-[10px]">
          <el-option v-for="item in referenceLigand" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleGenerateMap">生成</el-button>
        <el-button @click="perturbationGraphShow">配体微扰图</el-button>
      </el-form-item>
    </div>
    <PerturbationGraphDialog v-model:visible="perturbationGraphVisible" />
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
</style>
