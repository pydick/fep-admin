<script setup lang="ts">
import { ref } from "vue";
import DetailIcon from "@/assets/svg/detail.svg?component";
import { useRouter } from "vue-router";
import ParameterDialog from "./components/ParameterDialog/index.vue";
import { Delete, InfoFilled, RefreshRight, WarningFilled, Close } from "@element-plus/icons-vue";
import { tabListEnum } from "@/views/inno-fep/const/index";
import { ElMessage } from "element-plus";
defineOptions({
  name: "RecentResult"
});

interface Props {
  activeName: string;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:activeName", value: string): void;
}>();

const router = useRouter();
// 蛋白数据
const taskData = ref([
  {
    time: "2025-09-17 10:00:00",
    name: "Docking Task 2900",
    type: "Semi-Docking",
    status: 0
  }
]);

const taskColumns = [
  {
    type: "selection",
    align: "left",
    width: 50,
    align: "center"
  },
  {
    label: "创建时间",
    prop: "time",
    minWidth: 150,
    align: "center"
  },
  {
    label: "任务名称",
    prop: "name",
    minWidth: 150,
    align: "center"
  },
  {
    label: "任务类别",
    prop: "type",
    minWidth: 150,
    align: "center"
  },
  {
    label: "运行状态",
    prop: "status",
    minWidth: 150,
    align: "center"
  },
  {
    label: "操作",
    align: "center",
    prop: "opreate",
    minWidth: 200,
    slot: "opreate"
  }
];

const current_page = ref(1);
const page_size = ref(10);
const task_count = ref(50);
const handleCurrentChange = (page: number) => {
  current_page.value = page;
  console.log(page);
};
const gotoDetail = (type: string, id: string) => {
  console.log(type, id);
  router.push("/inno-fep/detail");
};
const showParameterDialog = ref(false);
const openParameterDialog = (row: any) => {
  console.log(row);
  showParameterDialog.value = true;
};
const gotoCreateTask = () => {
  console.log("gotoCreateTask");
  emit("update:activeName", tabListEnum[0].name);
};

const exceptionReason = ref("");
const exceptionReasonVisible = ref(false);
const showExceptionReason = (id: string) => {
  console.log(id);
  exceptionReason.value = "该任务异常原因";
  exceptionReasonVisible.value = true;
};

const exceptionReasonClose = () => {
  console.log("11111111111111");
  exceptionReasonVisible.value = false;
};

const deleteTask = (id: string) => {
  console.log(id);
  ElMessage.success("删除成功");
};
const dialogOptions = ref({
  data: {
    type: "docking"
  }
});
</script>

<template>
  <div class="recentresult-container">
    <pure-table :data="taskData" :columns="taskColumns" class="m-pure-table flex-1">
      <template #opreate="{ row }">
        <el-tooltip content="去创建任务" placement="top" effect="light">
          <el-button :icon="RefreshRight" circle plain @click="gotoCreateTask" />
        </el-tooltip>

        <el-tooltip content="参数详情" placement="top" effect="light">
          <el-button :icon="InfoFilled" circle plain @click="openParameterDialog(row)" />
        </el-tooltip>

        <el-tooltip content="删除任务" placement="top" effect="light">
          <span class="inline-block mx-[8px]">
            <el-popconfirm title="该操作不能恢复，确认删除该任务吗？" :icon="WarningFilled" width="300px" placement="bottom" @confirm="deleteTask(row.id)">
              <template #reference>
                <el-button :icon="Delete" circle plain type="danger" />
              </template>
            </el-popconfirm>
          </span>
        </el-tooltip>

        <el-tooltip content="任务异常" placement="top" effect="light">
          <span class="inline-block mx-[8px]">
            <el-popover ref="popover" :visible="exceptionReasonVisible" popper-class="relative" placement="bottom" title="异常原因" trigger="focus">
              <template #default>
                <el-icon class="cursor-pointer text-gray-400 hover:text-gray-600 exception-close-icon" @click="exceptionReasonClose">
                  <Close />
                </el-icon>
                {{ exceptionReason }}
              </template>
              <template #reference>
                <el-button :icon="WarningFilled" circle plain @click="showExceptionReason(row.id)" />
              </template>
            </el-popover>
          </span>
        </el-tooltip>

        <el-tooltip content="结果详情" placement="top" effect="light">
          <el-button :icon="DetailIcon" circle plain @click="gotoDetail(row.type, row.id)" />
        </el-tooltip>
      </template>
    </pure-table>
    <div class="pt-[15px]">
      <el-pagination align="center" :current-page="current_page" :page-size="page_size" layout="total, prev, pager, next, jumper" :total="task_count" @current-change="handleCurrentChange" />
    </div>
    <ParameterDialog v-model:visible="showParameterDialog" :options="dialogOptions" />
  </div>
</template>

<style lang="scss" scoped>
.recentresult-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  .m-pure-table {
    :deep(.el-table--fit) {
      height: 100%;
    }
  }
}
</style>
<style lang="scss">
.exception-close-icon {
  position: absolute;
  right: 4px;
  top: 4px;
  width: 20px;
  height: 20px;
}
</style>
