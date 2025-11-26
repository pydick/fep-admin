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
const queryPageData = (params: { page: number; pageSize?: number }) => {
  const queryParams = {
    action: "query",
    page: params.page,
    pageSize: params.pageSize ?? 10
  };
  sendMessage(queryParams);
};

const handleCurrentChange = (page: number) => {
  loading.value = true;
  queryPageData({ page, pageSize: pagination.pageSize });
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

const userId = useUserStoreHook().userId;
const wsBaseUrl = import.meta.env.VITE_WS_URL;
const { connectWebSocket, sendMessage } = useWebSocket({
  wsUrl: `${apiV1}/cal-analysis/ws/tasks?user_id=${userId}`,
  onMessage: message => {
    const tableData = message;
    const { page, pageSize, total, data } = tableData;
    taskData.value = data;
    pagination.total = total || 0;
    pagination.page = page || 1;
    pagination.pageSize = pageSize || 10;
    loading.value = false;
  },
  onConnected: () => {
    queryPageData({ page: 1, pageSize: pagination.pageSize });
  },
  onError: () => {
    loading.value = false;
  }
});

const handleSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  queryPageData({ page: 1, pageSize: pagination.pageSize });
};
const statusTypeMap = {
  COMMITTED: "primary",
  PENDING: "primary",
  STARTED: "primary",
  SUCCESS: "success",
  FAIL: "danger"
};
const statusTextMap = {
  COMMITTED: "已提交",
  PENDING: "队列中",
  STARTED: "执行中",
  SUCCESS: "成功",
  FAIL: "失败"
};
onMounted(() => {
  loading.value = true;
  connectWebSocket();
});
</script>

<template>
  <div v-loading="loading" element-loading-text="加载中..." class="recentresult-container">
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

        <el-tooltip content="删除任务" placement="top">
          <span class="inline-block mx-[8px]">
            <el-popconfirm title="该操作不能恢复，确认删除该任务吗？" :icon="WarningFilled" width="300px" placement="bottom" @confirm="deleteTask(row.id)">
              <template #reference>
                <el-button :icon="Delete" circle plain type="danger" />
              </template>
            </el-popconfirm>
          </span>
        </el-tooltip>

        <el-tooltip content="任务异常" placement="top">
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

        <el-tooltip content="结果详情" placement="top">
          <el-button :icon="Position" circle plain @click="gotoDetail(row.type, row.id)" />
        </el-tooltip>
      </template>
    </pure-table>
    <div class="pt-[15px]">
      <el-pagination v-model:page-size="pagination.pageSize" align="center" :current-page="pagination.page" layout="total, sizes, prev, pager, next" :page-sizes="[2, 5, 10, 20]" :total="pagination.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <ParameterDialog v-model:visible="showParameterDialog" :options="dialogOptions" />
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
