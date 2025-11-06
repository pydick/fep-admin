<script setup lang="ts">
import { ref } from "vue";
import { tableData } from "./data";
import { ElTag, ElButton, ElMessage } from "element-plus";
import { removeLigand } from "@/api/fep";

const tableRef = ref();
interface IProps {
  data?: any[];
}
const props = withDefaults(defineProps<IProps>(), {
  data: () => []
});
const emit = defineEmits<{
  "update:data": [value: any[]];
}>();

const multipleSelection = ref([]);
const handleSelectionChange = val => {
  multipleSelection.value = val;
};

const handleDelete = async row => {
  const res = await removeLigand({ indices_to_remove: [row.id] });
  if (res.success) {
    ElMessage.success("删除成功");
    const newData = res.data.molecules;
    emit("update:data", newData);
  } else {
    ElMessage.error("删除失败");
  }
};

const columns: TableColumnList = [
  {
    type: "selection",
    align: "center",
    width: 50
  },
  {
    label: "配体编号",
    prop: "id",
    minWidth: 80,
    align: "center"
  },
  {
    label: "分子名称",
    prop: "name",
    minWidth: 80,
    align: "center"
  },
  {
    label: "2D图形",
    prop: "structure",
    minWidth: 100,
    align: "center",
    slot: "2dStructure"
  },
  {
    label: "状态",
    prop: "status",
    minWidth: 100,
    align: "center",
    slot: "status"
  },
  {
    label: "操作",
    fixed: "right",
    width: 100,
    align: "center",
    slot: "operation"
  }
];

const emptyText = ref("暂无数据");
</script>

<template>
  <div class="li-table-wrapper">
    <pure-table ref="tableRef" :data="props.data" :columns="columns" border :empty-text="emptyText" cell-class-name="h-[60px]" @selection-change="handleSelectionChange">
      <template #status="{ row }">
        <el-tag v-if="row.status === 'success'" type="success" effect="plain">成功</el-tag>
        <el-tag v-else-if="row.status === 'warning'" type="warning" effect="plain">警告</el-tag>
        <el-tag v-else type="danger" effect="plain">失败</el-tag>
      </template>
      <template #2dStructure="{ row }">
        <div v-if="row.structure" class="structure-container w-[42px] h-[42px]" v-html="row.structure" />
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" size="small" @click="handleDelete(row)">删除</el-button>
      </template>
    </pure-table>
  </div>
</template>

<style scoped lang="scss">
.li-table-wrapper {
  margin: 15px 0;

  :deep(.molecule-structure) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
