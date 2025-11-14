<script setup lang="ts">
defineOptions({
  name: "Fepheader"
});
const cardHeader = {
  title: "Inno-FEP",
  description: "Inno-FEP是一个专注于相对结合自由能预测的计算模块。它通过精确计算同系物之间结合自由能的差异，直接评估化学修饰的利弊，从而将先导化合物优化从“试错”转变为数据驱动的“设计”过程，大幅提升研发效率。",
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
