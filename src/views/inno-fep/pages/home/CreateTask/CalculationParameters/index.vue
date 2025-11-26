<script setup lang="ts">
import BlcokTitle from "@/views/inno-fep/components/BlcokTitle/index.vue";
import { ref, reactive, h, inject, computed } from "vue";
import { ElTag } from "element-plus";

defineOptions({
  name: "CalculationParameters"
});

// 注入父组件提供的任务表单数据对象
const taskFormData = inject<any>("taskFormData");
const proteinFileName = inject<any>("proteinFileName");

interface IProps {
  pairList?: any[];
}
const props = withDefaults(defineProps<IProps>(), {
  pairList: () => []
});

// 蛋白数据
const proteinData = computed(() => {
  return [
    {
      id: 1,
      name: proteinFileName.value,
      createTime: "-"
    }
  ];
});

defineExpose({
  clearData: () => clearData()
});

const step3FormInitialValues = {
  proteinForceField: "力场3",
  ligandForceField: "力场2",
  simulationTime: 2,
  selectedProteins: [],
  selectedLigandPairs: []
};
const clearData = () => {
  Object.assign(step3Form, step3FormInitialValues);
};

const step3Form = reactive({
  ...step3FormInitialValues
});

// 力场选项
const proteinForceFields = ref([
  { label: "力场1", value: "力场1" },
  { label: "力场2", value: "力场2" },
  { label: "力场3", value: "力场3" }
]);

const ligandForceFields = ref([
  { label: "力场1", value: "力场1" },
  { label: "力场2", value: "力场2" },
  { label: "力场3", value: "力场3" }
]);

// 蛋白表格列配置
const proteinColumns = [
  {
    label: "名称",
    prop: "name",
    minWidth: 150,
    align: "center"
  },
  {
    label: "创建时间",
    prop: "createTime",
    minWidth: 120,
    align: "center"
  }
];

// 配体对表格列配置
const ligandPairColumns = [
  {
    label: "配体对",
    prop: "ligandPair",
    minWidth: 150,
    align: "center"
  },
  {
    label: "相似性",
    prop: "similarity",
    minWidth: 100,
    cellRenderer: ({ row }) => {
      return h("span", { class: "similarity-value" }, row.similarity.toFixed(3));
    },
    align: "center"
  }
];

// 表格选择处理
const proteinSelection = ref([]);
const ligandPairSelection = ref([]);

taskFormData.step3Form = step3Form;

const handleProteinSelectionChange = val => {
  proteinSelection.value = val;
  step3Form.selectedProteins = val;
};

const handleLigandPairSelectionChange = val => {
  ligandPairSelection.value = val;
  step3Form.selectedLigandPairs = val;
};
</script>

<template>
  <el-form class="flex-1" label-position="right">
    <!-- 用于计算的蛋白 -->
    <BlcokTitle title="用于计算的蛋白" />
    <div class="pt-[15px]">
      <pure-table :data="proteinData" :columns="proteinColumns" @selection-change="handleProteinSelectionChange" />
    </div>

    <!-- 用于计算的配体对 -->
    <BlcokTitle title="用于计算的配体对" />
    <div class="pt-[15px]">
      <pure-table :data="props.pairList" :columns="ligandPairColumns" @selection-change="handleLigandPairSelectionChange" />
    </div>

    <!-- 模拟参数 -->
    <BlcokTitle title="模拟参数" />
    <div class="pt-[15px]">
      <p class="text-sm text-gray-600 mb-[15px]! mt-0!">模拟时间设置上限为10ns</p>

      <div class="pb-[15px] flex flex-wrap">
        <el-form-item label="蛋白力场" label-width="100px">
          <el-select v-model="step3Form.proteinForceField" placeholder="选择蛋白力场" class="select-w-responsive">
            <el-option v-for="item in proteinForceFields" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="配体力场" label-width="100px" class="">
          <el-select v-model="step3Form.ligandForceField" placeholder="选择配体力场" class="select-w-responsive">
            <el-option v-for="item in ligandForceFields" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="模拟时间" label-width="100px" class="">
          <div class="flex items-center">
            <el-input-number v-model="step3Form.simulationTime" :min="0.1" :max="10" :step="0.1" :precision="1" class="w-[120px] mr-[10px]" />
            <span class="text-gray-600">ns</span>
          </div>
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>

<style lang="scss" scoped>
.similarity-value {
  font-weight: 500;
  color: var(--el-color-primary);
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}
</style>
