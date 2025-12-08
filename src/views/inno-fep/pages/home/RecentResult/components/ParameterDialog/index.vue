<script setup lang="ts">
import Content from "./components/Content.vue";
import { reactive, computed, watch, ref, nextTick } from "vue";
import { ElLoading } from "element-plus";
defineOptions({
  name: "ParameterDialog"
});
interface Props {
  visible: boolean;
  taskId: string;
}
const props = withDefaults(defineProps<Props>(), {});
const contentRef = ref();
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();
const handleClose = () => {
  emit("update:visible", false);
};
const innerVisible = computed({
  get: () => props.visible,
  set: value => emit("update:visible", value)
});

const dialogConfig = reactive({
  width: "550px",
  title: "任务参数详情",
  top: "15vh",
  center: true
});
watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      await nextTick();
      const loading = ElLoading.service({
        lock: true,
        target: "#parameterDialog"
      });
      await contentRef.value.getTaskParamsData(props.taskId);
      loading.close();
    }
  },
  { immediate: true }
);
</script>

<template>
  <el-dialog id="parameterDialog" v-model="innerVisible" v-bind="dialogConfig" :before-close="handleClose" :close-on-click-modal="false" @close="handleClose">
    <Content ref="contentRef" />
  </el-dialog>
</template>

<style lang="scss" scoped>
.parameter-dialog {
  // width: 40%;
  // @media (min-width: 1520px) {
  //   width: 60%;
  // }
}
</style>
