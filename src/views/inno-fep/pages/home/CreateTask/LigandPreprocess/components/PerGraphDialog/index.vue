<script setup lang="ts">
import { ref, watch, inject } from "vue";
import PerturbationGraph from "@/views/inno-fep/components/PerturbationGraph/index.vue";
import MappingGraph from "./MappingGraph/index.vue";
import BlcokTitle from "@/views/inno-fep/components/BlcokTitle/index.vue";
import { prepareLigand } from "@/api/fep";
import { useTaskStoreHook } from "@/store/modules/task";
import { ElMessage, ElLoading } from "element-plus";
const excludeEdges = inject<any>("excludeEdges");
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
const perGraphParams = inject<any>("perGraphParams");
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();

const hasEdit = ref(false);

const handleSure = async () => {
  perGraphParams.value = {
    step: 2,
    use_user_defined_map_flag: hasEdit.value,
    user_pair_list: hasEdit.value ? (perturbationGraphRef.value?.getAllEdgeData().map(item => [item.source, item.target]) ?? []) : []
  };
  excludeEdges.value.isNeedRemind = true;
  emit("update:visible", false);
};
const handleCancel = () => {
  excludeEdges.value.isNeedRemind = true;
  emit("update:visible", false);
};
const handleEdgeChange = (value: any) => {
  edgeData.value = value;
};
</script>

<template>
  <el-dialog id="perGraphDialog" v-model="props.visible" :close-on-click-modal="false" :show-close="false" title="配体微扰图" class="per-graph-dialog" header-class="pb-[0px]!">
    <el-row :gutter="15" class="h-full">
      <el-col :span="12" class="h-full">
        <BlcokTitle title="微扰图" class="pb-[15px]" />
        <div class="perturbation-container h-full">
          <PerturbationGraph ref="perturbationGraphRef" v-model:hasEdit="hasEdit" class="pt-[15px] h-[600px]!" :isSelectedFirstEdge="true" @edgeChange="handleEdgeChange" />
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
