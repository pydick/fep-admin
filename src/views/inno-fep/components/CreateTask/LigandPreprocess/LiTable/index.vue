<script setup lang="ts">
import { ref, h } from "vue";
import { tableData } from "./data";
import { ElTag, ElButton } from "element-plus";

const tableRef = ref();

const multipleSelection = ref([]);
const handleSelectionChange = val => {
  multipleSelection.value = val;
};

const handleDelete = row => {
  console.log("删除", row);
};

const columns: TableColumnList = [
  {
    type: "selection",
    align: "left",
    width: 50
  },
  {
    label: "配体编号",
    prop: "ligandCode",
    minWidth: 100
  },
  {
    label: "分子名称",
    prop: "name",
    minWidth: 100
  },
  {
    label: "2D图形",
    prop: "structure",
    minWidth: 150,
    cellRenderer: ({ row }) => {
      return h("div", { class: "molecule-structure" }, [
        h("img", {
          src: row.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5Ij7liIblrZDnu5PmnoQ8L3RleHQ+PC9zdmc+",
          alt: row.name,
          style: { width: "100px", height: "50px", objectFit: "contain" }
        })
      ]);
    }
  },
  {
    label: "状态",
    prop: "status",
    minWidth: 100,
    cellRenderer: ({ row }) => {
      const statusMap = {
        pass: { text: "通过", type: "success", icon: "✓" },
        warning: { text: "警告", type: "warning", icon: "!" },
        fail: { text: "不通过", type: "danger", icon: "✗" }
      };
      const status = statusMap[row.status] || statusMap.pass;
      return h(
        ElTag,
        {
          type: status.type,
          effect: "plain"
        },
        () => `${status.icon} ${status.text}`
      );
    }
  },
  {
    label: "操作",
    fixed: "right",
    width: 100,
    slot: "operation"
  }
];
</script>

<template>
  <div class="li-table-wrapper">
    <pure-table ref="tableRef" :data="tableData" :columns="columns" border @selection-change="handleSelectionChange">
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
