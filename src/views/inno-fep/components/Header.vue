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
  <div>
    <h2 class="font-extrabold">{{ cardHeader.title }}</h2>
    <p>
      <span class="height-[21px] leading-[21px] align-middle">{{ cardHeader.description }}</span>
      <el-link type="primary" :href="cardHeader.link" target="_blank" underline="never">更多详情</el-link>
    </p>
  </div>
</template>

<style lang="scss" scoped></style>
