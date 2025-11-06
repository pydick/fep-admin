<script setup lang="ts">
import FluentSave16Regular from "~icons/fluent/save-16-regular";
import { Download } from "@element-plus/icons-vue";
defineOptions({
  name: "FileRow"
});
const fileDownload = () => {
  console.log("下载");
};
const fileSave = () => {
  console.log("保存");
};
</script>

<template>
  <div class="flex-1 flex items-center justify-end">
    <el-tooltip content="文件保存" placement="top">
      <el-icon :size="20" class="mr-[15px] icon-hover" @click="fileSave()">
        <FluentSave16Regular />
      </el-icon>
    </el-tooltip>
    <el-tooltip content="文件下载" placement="top">
      <el-icon :size="20" class="mr-[15px] icon-hover" @click="fileDownload()"><Download /></el-icon>
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped></style>
