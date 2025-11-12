<script setup lang="ts">
import Content from "./components/Content.vue";
import { reactive } from "vue";
defineOptions({
  name: "ParameterDialog"
});
interface Props {
  visible?: boolean;
  options?: any;
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  options: () => ({})
});
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();
const handleClose = () => {
  emit("update:visible", false);
};
const dialogConfig = reactive({
  width: "550px",
  title: "任务参数详情",
  top: "15vh",
  center: true
});
</script>

<template>
  <el-dialog v-model="props.visible" v-bind="dialogConfig" :before-close="handleClose" :close-on-click-modal="false">
    <Content :options="props.options" />
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
