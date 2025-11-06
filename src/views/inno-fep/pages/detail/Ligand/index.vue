<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from "vue";
import { Star, StarFilled } from "@element-plus/icons-vue";
import { mocksvg } from "./data";

defineOptions({
  name: "Ligand"
});

const tableRef = ref();

// 示例数据，根据截图
const ligandData = reactive([
  {
    id: "cpd1",
    structure: mocksvg,
    dgFep: "-11.23±0.016",
    dgExp: "-12.12",
    isFavorite: false
  },
  {
    id: "cpd2",
    structure: mocksvg,
    dgFep: "-11.02±0.123",
    dgExp: "-11.02",
    isFavorite: false
  },
  {
    id: "cpd3",
    structure: mocksvg,
    dgFep: "-12.34±0.016",
    dgExp: "-11.02",
    isFavorite: false
  },
  {
    id: "cpd4",
    structure: mocksvg,
    dgFep: "-12.34±0.016",
    dgExp: "-12.34",
    isFavorite: false
  }
]);

const ligandColumns = [
  {
    type: "selection",
    align: "center",
    width: 40
  },
  {
    label: "ID",
    prop: "id",
    minWidth: 100,
    align: "center"
  },
  {
    label: "结构",
    prop: "structure",
    minWidth: 150,
    align: "center",
    slot: "structure"
  },
  {
    label: "ΔG_FEP",
    prop: "dgFep",
    minWidth: 130,
    align: "center"
  },
  {
    label: "ΔG_Exp",
    prop: "dgExp",
    minWidth: 130,
    align: "center"
  },
  {
    label: "操作",
    align: "center",
    prop: "operation",
    width: 80,
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

// 设置默认选中第一行（cpd1）
onMounted(() => {
  nextTick(() => {
    if (tableRef.value && ligandData[0]) {
      const elTable = tableRef.value?.$refs?.pureTableTable;
      if (elTable) {
        elTable.toggleRowSelection(ligandData[0], true);
      }
    }
  });
});
</script>

<template>
  <div class="ligand-container">
    <pure-table ref="tableRef" :data="ligandData" :columns="ligandColumns" class="m-pure-table-fit flex-1" cell-class-name="h-[60px]">
      <template #operation="{ row }">
        <div class="operation-buttons">
          <el-button :icon="row.isFavorite ? 'StarFilled' : 'Star'" class="star-icon-btn" circle plain @click="handleFavorite(row)" />
        </div>
      </template>
      <template #structure="{ row }">
        <div class="structure-container w-[42px] h-[42px]" v-html="row.structure" />
      </template>
    </pure-table>
    <div class="pt-[15px]">
      <el-pagination align="center" :current-page="pagination.current_page" :page-size="pagination.page_size" layout="total, prev, pager, next, jumper" :total="pagination.total" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ligand-container {
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

// .structure-container {
//   width: 70px;
//   height: 50px;
//   margin: 0 auto;
//   :deep(svg) {
//     width: 100% !important;
//     height: 100% !important;

//     & > rect:first-of-type {
//       fill: transparent !important;
//     }
//   }
// }
</style>
