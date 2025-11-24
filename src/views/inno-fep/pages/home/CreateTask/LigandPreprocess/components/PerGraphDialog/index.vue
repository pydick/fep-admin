<script setup lang="ts">
import { ref, watch } from "vue";
import PerturbationGraph from "@/views/inno-fep/components/PerturbationGraph/index.vue";
import MappingGraph from "./MappingGraph/index.vue";
import BlcokTitle from "@/views/inno-fep/components/BlcokTitle/index.vue";
import { prepareLigand } from "@/api/fep";
import { useTaskStoreHook } from "@/store/modules/task";
import { ElMessage } from "element-plus";
const taskStore = useTaskStoreHook();
defineOptions({
  name: "PerturbationGraphDialog"
});
interface Props {
  visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  visible: false
});

const edgeData = ref<any>(null);
const perturbationGraphRef = ref<any>(null);
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();
const handleSure = async () => {
  const params = {
    task_id: taskStore.taskId,
    step: 2,
    use_user_defined_map_flag: true,
    user_pair_list: perturbationGraphRef.value?.getAllEdgeData().map(item => [item.source, item.target]) ?? []
  };
  const res = await prepareLigand(params);
  if (res.success) {
    emit("update:visible", false);
  } else {
    ElMessage.error(res.message);
  }
};
const handleCancel = () => {
  emit("update:visible", false);
};
const handleEdgeChange = (value: any) => {
  edgeData.value = value;
};
watch(
  () => props.visible,
  newVal => {
    console.log(newVal);
  },
  {
    immediate: true
  }
);
</script>

<template>
  <el-dialog v-model="props.visible" :close-on-click-modal="false" :show-close="false" title="配体微扰图" class="per-graph-dialog" header-class="pb-[0px]!">
    <el-row :gutter="15" class="h-full">
      <el-col :span="12" class="h-full">
        <BlcokTitle title="微扰图" class="pb-[15px]" />
        <div class="perturbation-container h-full">
          <PerturbationGraph ref="perturbationGraphRef" class="pt-[15px] h-[600px]!" :isDialogEnter="true" :isSelectedFirstEdge="true" @edgeChange="handleEdgeChange" />
        </div>
      </el-col>
      <el-col :span="12" class="h-full">
        <BlcokTitle title="映射图" class="pb-[15px]" />
        <MappingGraph :edgeData="edgeData" />
      </el-col>
    </el-row>
    <template #footer>
      <div>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSure">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
<style lang="scss">
.per-graph-dialog {
  width: 70%;
  @media (min-width: 1520px) {
    width: 60%;
  }
}
</style>
