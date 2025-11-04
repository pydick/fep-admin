<template>
  <div class="custom-toolbar">
    <el-tooltip content="放大" placement="top">
      <ZoomIn style="width: 20px; height: 20px; color: #333333; cursor: pointer" @click="zoomIn" />
    </el-tooltip>

    <el-tooltip content="缩小" placement="top">
      <ZoomOut style="width: 20px; height: 20px; color: #333333; cursor: pointer" @click="zoomOut" />
    </el-tooltip>
    <el-tooltip content="居中" placement="top">
      <Location style="width: 20px; height: 20px; color: #333333; cursor: pointer" @click="autoFit" />
    </el-tooltip>

    <el-tooltip content="重置" placement="top" effect="dark">
      <RefreshRight style="width: 20px; height: 20px; color: #333333" @click="resetGraph" />
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Graph } from "@antv/g6";
import { ZoomIn, ZoomOut, Location, RefreshRight } from "@element-plus/icons-vue";

const props = defineProps<{ graph: Graph }>();
const isCentered = ref(true);

const zoomIn = () => {
  const currentZoom = props.graph.getZoom();
  const zoomFactor = 1.1;
  if (currentZoom < 1.6) props.graph.zoomBy(zoomFactor);
};

const zoomOut = () => {
  const currentZoom = props.graph.getZoom();
  const zoomFactor = 0.9;
  if (currentZoom > 0.8) props.graph.zoomBy(zoomFactor);
};

const autoFit = () => {
  props.graph.fitCenter();
};

const resetGraph = () => {
  props.graph.zoomTo(1);
  props.graph.render();
};
</script>

<style scoped>
.custom-toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 6px 8px;
  display: flex;
  gap: 6px;
}
</style>
