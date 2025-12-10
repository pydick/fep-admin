<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import ParameterDialog from "./components/ParameterDialog/index.vue";
import { Delete, InfoFilled, RefreshRight, WarningFilled, Close, Position } from "@element-plus/icons-vue";
import { tabListEnum } from "@/views/inno-fep/const/index";
import { ElMessage } from "element-plus";
import useWebSocket from "./websocket";
import { useUserStoreHook } from "@/store/modules/user";
import { apiV1 } from "@/config/api";
import { taskDelete } from "@/api/fep";
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
const taskData = ref([]);
// loading 状态
const loading = ref(false);

const taskColumns = [
  {
    type: "selection",
    width: 50,
    align: "center"
  },
  {
    label: "任务编号",
    prop: "task_id",
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
    label: "运行状态",
    prop: "status",
    minWidth: 150,
    align: "center",
    slot: "status"
  },
  {
    label: "创建时间",
    prop: "time",
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

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

// 发送分页查询请求
const queryPageData = (params: { page?: number; pageSize?: number } = {}) => {
  const queryParams = {
    type: "query",
    page: params.page ?? 1,
    pageSize: params.pageSize ?? pagination.pageSize
  };
  sendMessage(queryParams);
};

const handleCurrentChange = (page: number) => {
  loading.value = true;
  queryPageData({ page });
};
const gotoDetail = (task_id: string) => {
  router.push(`/inno-fep/detail?task_id=${task_id}`);
};
const showParameterDialog = ref(false);
const openParameterDialog = (row: any) => {
  dialogTaskId.value = row.task_id;
  showParameterDialog.value = true;
};
const gotoCreateTask = () => {
  console.log("gotoCreateTask");
  emit("update:activeName", tabListEnum[0].name);
};

const exceptionReason = ref<Record<string, string>>({});
const exceptionReasonVisible = ref<Record<string, boolean>>({});
const showExceptionReason = (taskId: string, err_message: string) => {
  exceptionReason.value[taskId] = err_message || "-";
  Object.keys(exceptionReasonVisible.value).forEach(key => {
    exceptionReasonVisible.value[key] = false;
  });
  exceptionReasonVisible.value[taskId] = true;
};

const exceptionReasonClose = (taskId: string) => {
  exceptionReasonVisible.value[taskId] = false;
};

const deleteTask = async (id: string) => {
  try {
    loading.value = true;
    const res = await taskDelete({ task_ids: [id] });
    if (res.success) {
      ElMessage.success("删除成功");
      queryPageData({ page: 1 });
    } else {
      ElMessage.error(res.message);
    }
  } finally {
    loading.value = false;
  }
};
const dialogTaskId = ref("");

const userId = useUserStoreHook().userId;
const wsBaseUrl = import.meta.env.VITE_WS_URL;
const { connectWebSocket, sendMessage } = useWebSocket({
  wsUrl: `${apiV1}/cal-analysis/ws/tasks?user_id=${userId}`,
  onMessage: message => {
    const tableData = message;
    console.log(11, tableData);
    const { page, page_size, total, data } = tableData;
    taskData.value = data;
    pagination.total = total || 0;
    pagination.page = page || 1;
    pagination.pageSize = page_size || 10;
    loading.value = false;
  },
  onConnected: () => {
    // queryPageData();
  },
  onError: () => {
    loading.value = false;
  }
});

const handleSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  queryPageData({ pageSize: pagination.pageSize });
};
const statusTypeMap = {
  COMMITTED: "primary",
  CAL_PENDING: "primary",
  CAL_STARTED: "primary",
  CALCULATED: "success",
  CAL_FAIL: "danger",
  ANALYZE_PENDING: "primary",
  ANALYZE_STARTED: "primary",
  ANALYZED: "success",
  ANALYZE_FAIL: "danger"
};
const statusTextMap = {
  COMMITTED: "计算排队中",
  CAL_PENDING: "计算排队中",
  CAL_STARTED: "计算执行中",
  CALCULATED: "计算完成",
  CAL_FAIL: "CAL_FAIL",
  ANALYZE_PENDING: "分析排队中",
  ANALYZE_STARTED: "分析执行中",
  ANALYZED: "分析完成",
  ANALYZE_FAIL: "分析失败"
};
onMounted(() => {
  loading.value = true;
  connectWebSocket();
});
</script>

<template>
  <div v-loading="loading" class="recentresult-container">
    <pure-table :data="taskData" :columns="taskColumns" class="m-pure-table-fit flex-1" cell-class-name="h-[60px]">
      <template #status="{ row }">
        <el-tag :type="statusTypeMap[row.status]">{{ statusTextMap[row.status] }}</el-tag>
      </template>
      <template #opreate="{ row }">
        <el-tooltip content="去创建任务" placement="top">
          <el-button :icon="RefreshRight" circle plain @click="gotoCreateTask" />
        </el-tooltip>

        <el-tooltip content="参数详情" placement="top">
          <el-button :icon="InfoFilled" circle plain @click="openParameterDialog(row)" />
        </el-tooltip>

        <el-tooltip content="删除任务,只要分析完成的任务才能删除" placement="top">
          <span class="inline-block mx-[8px]">
            <el-popconfirm title="该操作不能恢复，确认删除该任务吗？" :icon="WarningFilled" width="300px" placement="bottom" @confirm="deleteTask(row.task_id)">
              <template #reference>
                <el-button :icon="Delete" circle plain type="danger" :disabled="row.status !== 'ANALYZED'" />
              </template>
            </el-popconfirm>
          </span>
        </el-tooltip>

        <el-tooltip content="任务异常" placement="top">
          <span class="inline-block mx-[8px]">
            <el-popover :ref="'popover' + row.task_id" :visible="exceptionReasonVisible[row.task_id]" popper-class="relative" placement="bottom" title="异常原因" trigger="focus">
              <template #default>
                <el-icon class="cursor-pointer text-gray-400 hover:text-gray-600 exception-close-icon" @click="exceptionReasonClose(row.task_id)">
                  <Close />
                </el-icon>
                {{ exceptionReason[row.task_id] }}
              </template>
              <template #reference>
                <el-button :icon="WarningFilled" :disabled="row.status !== 'ANALYZE_FAIL'" circle plain @click="showExceptionReason(row.task_id, row.err_message)" />
              </template>
            </el-popover>
          </span>
        </el-tooltip>

        <el-tooltip content="结果详情" placement="top">
          <el-button :icon="Position" circle plain @click="gotoDetail(row.task_id)" />
        </el-tooltip>
      </template>
    </pure-table>
    <div class="pt-[15px]">
      <el-pagination v-model:page-size="pagination.pageSize" align="center" :current-page="pagination.page" layout="total, sizes, prev, pager, next" :page-sizes="[2, 5, 10, 20]" :total="pagination.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <ParameterDialog v-if="showParameterDialog" v-model:visible="showParameterDialog" :taskId="dialogTaskId" />
  </div>
</template>

<style lang="scss" scoped>
.recentresult-container {
  display: flex;
  flex-direction: column;
  height: 100%;
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
