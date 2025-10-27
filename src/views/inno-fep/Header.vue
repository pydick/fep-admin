<script setup lang="ts">
defineOptions({
  name: "Fepheader"
});
const cardHeader = {
  title: "Inno-Fep",
  description: "Inno-Fep模块主要用于XXXXXXXXXXXXXXXX。",
  link: "https://www.baidu.com"
};
</script>

<template>
  <div class="border border-[var(--el-card-border-color)] py-[15px] px-[15px]">
    <h2 class="h-[24px] font-black leading-[24px]">{{ cardHeader.title }}</h2>
    <p class="pb-0">
      <span class="height-[21px] leading-[21px] align-middle">{{ cardHeader.description }}</span>
      <el-link type="primary" :href="cardHeader.link" target="_blank" underline="never">更多详情</el-link>
    </p>
  </div>
</template>
