<script setup lang="ts">
defineOptions({
  name: "CSstep"
});

interface Props {
  titleList?: string[];
  active?: number;
}

const props = withDefaults(defineProps<Props>(), {
  titleList: () => ["Step 1", "Step 2", "Step 3"],
  active: 1
});

const emit = defineEmits<{
  "update:active": [value: number];
}>();

const next = () => {
  if (props.active < props.titleList.length) {
    emit("update:active", props.active + 1);
  }
};

const prev = () => {
  if (props.active > 1) {
    emit("update:active", props.active - 1);
  }
};

defineExpose({
  next,
  prev
});
</script>

<template>
  <el-steps class="max-w-[600px]!" :active="active" finish-status="success" align-center>
    <el-step v-for="(title, index) in titleList" :key="index" :title="title" />
  </el-steps>
</template>

<style lang="scss" scoped></style>
