<template>
  <el-dialog v-model="options.visible" class="myDialog" :title="options.title" :close-on-click-modal="false" :width="options.width" :center="options.center" :top="options.top" :append-to-body="false" :before-close="handleClose">
    <slot ref="dialogContent" name="dialogContent" />
  </el-dialog>
</template>
<script setup>
import { reactive, ref, defineProps, toRef, defineEmits, onMounted } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
const props = defineProps({
  options: Object
});
const options = ref(props.options);
const emits = defineEmits(["close"]);
const handleClose = () => {
  if (options.value.confirm_close == true) {
    emits("close");
  } else {
    options.value.visible = false;
  }
};
const dialogContent = ref(null);
</script>
<style scoped lang="scss">
.myDialog {
}
</style>
