<script setup lang="ts">
import { reactive, computed } from "vue";
defineOptions({
  name: "Csdialog"
});
interface IProps {
  visible?: boolean;
  config?: Object;
}

const props = withDefaults(defineProps<IProps>(), {
  visible: false,
  config: () => ({})
});

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();
const innerVisible = computed({
  get: () => props.visible,
  set: value => emit("update:visible", value)
});
</script>

<template>
  <el-dialog v-model="innerVisible" v-bind="config">
    <slot />
  </el-dialog>
</template>

<style lang="scss" scoped></style>
