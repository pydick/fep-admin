<script setup lang="ts">
import { reactive } from "vue";
import { Star, Position } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
defineOptions({
  name: "Pairs"
});
const router = useRouter();
// 示例数据，根据截图
const pairsData = reactive([
  {
    id: 1,
    pair: "cpd1 → cpd2",
    confidence: "Bad",
    status: "Success",
    similarityScore: 0.961,
    mappingScore: 0.321,
    predictedDdGRaw: "2.35±0.016",
    predictedDdGCorrected: "2.12±0.012"
  },
  {
    id: 2,
    pair: "cpd3 → cpd4",
    confidence: "Good",
    status: "Success",
    similarityScore: 0.854,
    mappingScore: 0.961,
    predictedDdGRaw: "-1.12±0.123",
    predictedDdGCorrected: "-1.07±0.016"
  },
  {
    id: 3,
    pair: "cpd2 → cpd3",
    confidence: "Fair",
    status: "Success",
    similarityScore: 0.903,
    mappingScore: 0.643,
    predictedDdGRaw: "1.96±0.016",
    predictedDdGCorrected: "1.89±0.006"
  },
  {
    id: 4,
    pair: "cpd1 → cpd5",
    confidence: null,
    status: "Failed",
    similarityScore: 0.893,
    mappingScore: null,
    predictedDdGRaw: null,
    predictedDdGCorrected: null
  }
]);

const pairsColumns = [
  {
    type: "selection",
    align: "center",
    width: 40
  },
  {
    label: "Pair",
    prop: "pair",
    minWidth: 120,
    align: "center"
  },
  {
    label: "置信度",
    prop: "confidence",
    minWidth: 80,
    align: "center",
    slot: "confidence"
  },
  {
    label: "状态",
    prop: "status",
    minWidth: 85,
    align: "center",
    slot: "status"
  },
  // {
  //   label: "Similarity score",
  //   prop: "similarityScore",
  //   minWidth: 130,
  //   align: "center"
  // },
  {
    label: "Mapping score",
    prop: "mappingScore",
    minWidth: 130,
    align: "center",
    slot: "mappingScore"
  },
  {
    label: "Predicted ddG (Raw)",
    prop: "predictedDdGRaw",
    minWidth: 130,
    align: "center",
    slot: "predictedDdGRaw"
  },
  {
    label: "Predicted ddG (Corrected)",
    prop: "predictedDdGCorrected",
    minWidth: 130,
    align: "center",
    slot: "predictedDdGCorrected"
  },
  {
    label: "操作",
    align: "center",
    prop: "operation",
    width: 120,
    slot: "operation",
    fixed: "right"
  }
];

const pagination = reactive({
  current_page: 1,
  page_size: 10,
  total: 4
});

const handleCurrentChange = (page: number) => {
  pagination.current_page = page;
  console.log(page);
};

const handleFavorite = (row: any) => {
  row.isFavorite = !row.isFavorite;
  console.log("收藏", row);
};

const gotoDetail = (id: string) => {
  router.push("/inno-fep/analysis-detail");
};
</script>

<template>
  <div class="pairs-container">
    <pure-table :data="pairsData" :columns="pairsColumns" class="m-pure-table-fit flex-1" cell-class-name="h-[60px]">
      <template #confidence="{ row }">
        <span v-if="row.confidence" :class="['confidence-text', `confidence-${row.confidence.toLowerCase()}`]">
          {{ row.confidence }}
        </span>
        <span v-else class="confidence-empty">-</span>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'Success' ? 'primary' : 'info'" effect="dark" class="status-tag">
          {{ row.status }}
        </el-tag>
      </template>
      <template #mappingScore="{ row }">
        <span>{{ row.mappingScore || "-" }}</span>
      </template>
      <template #predictedDdGRaw="{ row }">
        <span>{{ row.predictedDdGRaw || "-" }}</span>
      </template>
      <template #predictedDdGCorrected="{ row }">
        <span>{{ row.predictedDdGCorrected || "-" }}</span>
      </template>
      <template #operation="{ row }">
        <div class="operation-buttons">
          <el-tooltip content="收藏" placement="top">
            <el-button :icon="row.isFavorite ? 'StarFilled' : 'Star'" class="star-icon-btn" circle plain @click="handleFavorite(row)" />
          </el-tooltip>

          <el-tooltip content="前往Paires详情" placement="top">
            <el-button :icon="Position" circle plain @click="gotoDetail(row.id)" />
          </el-tooltip>
        </div>
      </template>
    </pure-table>
    <div class="pt-[15px]">
      <el-pagination align="center" :current-page="pagination.current_page" :page-size="pagination.page_size" layout="total, prev, pager, next, jumper" :total="pagination.total" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pairs-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.confidence-text {
  font-weight: 500;

  &.confidence-bad {
    color: #f56c6c;
  }

  &.confidence-good {
    color: #67c23a;
  }

  &.confidence-fair {
    color: #e6a23c;
  }
}

.confidence-empty {
  color: #909399;
}

.status-tag {
  border-radius: 12px;
  padding: 2px 12px;
}

.empty-value {
  color: #909399;
}
</style>
