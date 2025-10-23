<script setup lang="ts">
import BlcokTitle from "../BlcokTitle.vue";
defineOptions({
  name: "LigandPreprocess"
});
</script>

<template>
  <el-row class="flex-1">
    <el-col :span="12" class="h-full pr-[10px]">配体微绕图</el-col>
    <el-col :span="12" class="h-full pr-[10px]">
      <BlcokTitle title="上传分子" />
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped></style>
