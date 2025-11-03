<script setup lang="ts">
import SvgBox from "@/components/CSsvgbox/index.vue";
defineOptions({
  name: "MappingGraph"
});
</script>

<template>
  <el-row>
    <el-col :span="12">
      <div class="mapping-item">
        <el-text class="mx-1" size="large">c5</el-text>
        <SvgBox width="200px" height="auto" />
        <el-text class="mx-1" size="large">c5</el-text>
      </div>
    </el-col>
    <el-col :span="12">
      <div class="mapping-item">
        <el-text class="mx-1" size="large">c5</el-text>
        <SvgBox width="200px" height="auto" />
        <el-text class="mx-1" size="large">c5</el-text>
      </div>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.mapping-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  width: 100%;
}
</style>
