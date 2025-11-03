<script setup lang="ts">
import SvgBox from "@/components/CSsvgbox/index.vue";
defineOptions({
  name: "GraphNode"
});
</script>

<template>
  <div class="node-container">
    <div class="text-center">
      <SvgBox class="svgBox w-[40px]! h-[40px]!" />
    </div>
    <span class="label-text">c5</span>
  </div>
</template>

<style lang="scss" scoped>
.node-container {
  border: 2px solid #eee;
  border-radius: 8px;
  text-align: center;
}
.svgBox {
  margin: 2px auto 2px;
}
.label-text {
  font-size: 12px;
  display: block;
  line-height: 1;
  padding-bottom: 5px;
}
</style>
