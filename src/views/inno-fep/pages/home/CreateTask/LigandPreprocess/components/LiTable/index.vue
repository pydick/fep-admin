<script setup lang="ts">
import { ref, inject, computed } from "vue";
import { tableData } from "./data";
import { ElTag, ElButton, ElMessage } from "element-plus";
import { removeLigand } from "@/api/fep";
import EditPen from "~icons/ep/edit-pen";
import Check from "~icons/ep/check";
const tableRef = ref();
const ligandStr = inject<any>("ligandStr");
import { svgToDataUrl } from "@/utils/common.js";

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
const handleSelectionChange = selectedArr => {
  multipleSelection.value = selectedArr;
  const data = selectedArr.map(item => item.ligandData);
  ligandStr.value = JSON.stringify(data);
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
    minWidth: 100,
    align: "center",
    slot: "name"
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
const editMap = ref({});
const onEdit = (row, index) => {
  editMap.value[index] = Object.assign({ ...row, editing: true });
};
const editing = computed(() => {
  return index => {
    return editMap.value[index]?.editing;
  };
});
const iconClass = computed(() => {
  return (index, other = false) => {
    return ["cursor-pointer", "ml-2", "transition", "delay-100", other ? ["hover:scale-110", "hover:text-red-500"] : editing.value(index) && ["scale-150", "text-red-500"]];
  };
});
const activeIndex = ref(-1);

const onMouseleave = index => {
  editing.value[index] ? (activeIndex.value = index) : (activeIndex.value = -1);
};

const onSave = function (index) {
  editMap.value[index].editing = false;
};

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
        <el-image :src="svgToDataUrl(row.structure)" :preview-src-list="[svgToDataUrl(row.structure)]" fit="contain" class="structure-img w-[42px] h-[42px]" :preview-teleported="true" />
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" size="small" @click="handleDelete(row)">删除</el-button>
      </template>
      <template #name="{ row, index }">
        <div class="flex-bc w-full" @mouseenter="activeIndex = index" @mouseleave="onMouseleave(index)">
          <p v-if="!editing(index)" class="w-[calc(100%-25px)]">{{ row.name }}</p>
          <div v-else class="flex-bc">
            <el-input v-model="row.name" />
            <iconify-icon-offline :icon="Check" :class="iconClass(index)" @click="onSave(index)" />
          </div>
          <iconifyIconOffline v-show="activeIndex === index && !editing(index)" :icon="EditPen" :class="iconClass(index, true)" @click="onEdit(row, index)" />
        </div>
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
