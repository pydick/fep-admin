<script setup lang="ts">
import SvgBox from "@drugflow/common/svgBox.vue";
defineOptions({
  name: "MappingGraph"
});
</script>

<template>
  <el-row :gutter="7.5">
    <el-col :span="12">
      <div class="mapping-item">
        <span>c5</span>
        <SvgBox />
        <span>c5</span>
      </div>
    </el-col>
    <el-col :span="12">
      <div class="mapping-item">
        <span>c6</span>
        <SvgBox />
        <span>c6</span>
      </div>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.mapping-item {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  width: 100%;
}
</style>
