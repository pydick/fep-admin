<script setup lang="ts">
import one from "./charts/one.vue";
import { mocksvg } from "./data";
import { ref, computed } from "vue";
const structure = ref(mocksvg);
// 将 SVG 字符串转换为 Data URL
const structurePreviewUrl = computed(() => {
  const svgBlob = new Blob([structure.value], { type: "image/svg+xml" });
  return URL.createObjectURL(svgBlob);
});

const svgToDataUrl = (svg: string) => {
  const svgBlob = new Blob([svg], { type: "image/svg+xml" });
  return URL.createObjectURL(svgBlob);
};

// 或者使用 base64 方式
const structureDataUrl = computed(() => {
  const base64 = btoa(unescape(encodeURIComponent(structure.value)));
  return `data:image/svg+xml;base64,${base64}`;
});
defineOptions({
  name: "AnalysisDetail"
});

const tableData = ref([
  {
    legs: "Solvated",
    conergence: mocksvg,
    overlapMatrix: mocksvg,
    replicaDistribution: mocksvg,
    rmsf: mocksvg,
    rotatableBonds: mocksvg
  },
  {
    legs: "Complex",
    conergence: mocksvg,
    overlapMatrix: mocksvg,
    replicaDistribution: mocksvg,
    rmsf: mocksvg,
    rotatableBonds: mocksvg
  }
]);

const columns = ref([
  {
    label: "Legs",
    prop: "legs",
    align: "center",
    width: 100
  },
  {
    label: "Conergence",
    prop: "conergence",
    slot: "conergence",
    align: "center"
  },
  {
    label: "Overlap Matrix",
    prop: "overlapMatrix",
    slot: "overlapMatrix",
    align: "center"
  },
  {
    label: "Replica Distribution",
    prop: "replicaDistribution",
    slot: "replicaDistribution",
    align: "center"
  },
  {
    label: "RMSF",
    prop: "rmsf",
    slot: "rmsf",
    align: "center"
  },
  {
    label: "Rotatable Bonds",
    prop: "rotatableBonds",
    slot: "rotatableBonds",
    align: "center"
  }
]);
</script>

<template>
  <div class="analysis-detail-container w-full h-full p-[15px]">
    <el-descriptions title="Pairs Info" direction="vertical" border>
      <el-descriptions-item :rowspan="3" :width="600" label="Pairs图" align="center">
        <el-image :src="structureDataUrl" :preview-src-list="[structureDataUrl]" fit="contain" class="structure-container" :preview-teleported="true" />
      </el-descriptions-item>
      <el-descriptions-item label="置信度">Bad</el-descriptions-item>
      <el-descriptions-item label="状态">success</el-descriptions-item>
      <el-descriptions-item label="Similarity score">0.961</el-descriptions-item>
      <el-descriptions-item label="Mapping score">0.321</el-descriptions-item>
      <el-descriptions-item label="Predicted ddG (Raw)">2.35±0.016</el-descriptions-item>
      <el-descriptions-item label="Predicted ddG (Corrected)">2.12±0.012</el-descriptions-item>
      <el-descriptions-item label="对比图表">
        <pure-table :data="tableData" :columns="columns" border>
          <template #conergence="{ row }">
            <el-image :src="svgToDataUrl(row.conergence)" :preview-src-list="[svgToDataUrl(row.conergence)]" fit="contain" class="w-full charts-photo" :preview-teleported="true" />
          </template>
          <template #overlapMatrix="{ row }">
            <div class="w-full charts-photo" v-html="row.overlapMatrix" />
          </template>
          <template #replicaDistribution="{ row }">
            <div class="w-full charts-photo" v-html="row.replicaDistribution" />
          </template>
          <template #rmsf="{ row }">
            <div class="w-full charts-photo" v-html="row.rmsf" />
          </template>
          <template #rotatableBonds="{ row }">
            <div class="w-full charts-photo" v-html="row.rotatableBonds" />
          </template>
        </pure-table>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style lang="scss" scoped>
.analysis-detail-container {
  background: #fff;
  .right-container {
    display: flex;
    flex-direction: column;
    .right-block1 {
      background-color: #f0f2f5;
    }
    .right-block {
      flex: 1;
    }
  }
}
.structure-container {
  height: 300px;
  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}

.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
  text-align: center;
}
.el-carousel__item {
  height: 100%;
}
:deep(.el-carousel__container) {
  height: 100%;
}
.charts-photo {
  height: 200px;
  width: 200px;
  margin: 0 auto;
  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}
:deep(.el-table) {
  .el-table__row {
    &:hover {
      background-color: transparent !important;
    }
    &:hover > td {
      background-color: transparent !important;
    }
  }
  .el-table__body tr:hover > td {
    background-color: transparent !important;
  }
}
</style>
