<script setup lang="ts">
defineOptions({
  name: "CScard"
});
</script>

<template>
  <el-card>
    <template #header>
      <slot name="header" />
    </template>
    <slot name="content" />
  </el-card>
</template>

<style lang="scss" scoped></style>
