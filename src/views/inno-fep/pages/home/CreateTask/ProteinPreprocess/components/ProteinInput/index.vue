<script setup lang="ts">
defineOptions({
  name: "ProteinInput"
});
</script>

<template>
  <div>
    <p class="label_1 m_top5">输入蛋白</p>
    <slot name="Tab" />
    <slot name="DatabaseInput" />
    <slot name="FileUpload" />
    <slot name="DataCenter" />
  </div>
</template>

<style lang="scss" scoped></style>
