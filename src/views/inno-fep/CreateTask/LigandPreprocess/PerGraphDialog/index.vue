<script setup lang="ts">
import { ref, watch } from "vue";
import PerturbationGraph from "@/views/inno-fep/components/PerturbationGraph/index.vue";
import MappingGraph from "./MappingGraph/index.vue";
import BlcokTitle from "@/views/inno-fep/components/BlcokTitle/index.vue";
defineOptions({
  name: "PerturbationGraphDialog"
});
interface Props {
  visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  visible: false
});

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();
const handleSure = () => {
  emit("update:visible", false);
};
const handleCancel = () => {
  emit("update:visible", false);
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
  <el-dialog v-model="props.visible" width="60%" title="配体微扰图" header-class="pb-[0px]!">
    <el-row :gutter="15">
      <el-col :span="12">
        <BlcokTitle title="微扰图" />
        <div class="perturbation-container">
          <PerturbationGraph class="pt-[15px]" />
        </div>
      </el-col>
      <el-col :span="12">
        <BlcokTitle title="映射图" />
        <MappingGraph class="pt-[15px]" />
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

<style lang="scss" scoped>
.perturbation-container {
  // width: 600px;
  // height: 600px;
}
</style>
