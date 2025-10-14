<script setup lang="ts">
defineOptions({
  name: "CScard"
});
</script>

<template>
  <el-card class="flex-1 flex flex-col" body-class="flex-1">
    <template #header>
      <slot name="header" />
    </template>
    <slot name="content" />
  </el-card>
</template>

<style lang="scss" scoped></style>
