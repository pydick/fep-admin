<script setup lang="ts">
import ReDialog from "@/components/ReDialog/index.vue";
import { ref, watch } from "vue";
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
  <ReDialog :visible="props.visible" title="微扰图dialog">
    <template #content>
      <div>微扰图dialog</div>
    </template>
    <template #footer>
      <div>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSure">确定</el-button>
      </div>
    </template>
  </ReDialog>
</template>

<style lang="scss" scoped></style>
