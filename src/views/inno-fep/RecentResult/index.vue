<script setup lang="ts">
import { ref } from "vue";
import DetailIcon from "@/assets/svg/detail.svg?component";
import { useRouter } from "vue-router";
defineOptions({
  name: "RecentResult"
});

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
    label: "任务时间",
    prop: "time",
    minWidth: 150,
    align: "left"
  },
  {
    label: "任务名称",
    prop: "name",
    minWidth: 150,
    align: "left"
  },
  {
    label: "任务类别",
    prop: "type",
    minWidth: 150,
    align: "left"
  },
  {
    label: "运行状态",
    prop: "status",
    minWidth: 150,
    align: "left"
  },
  {
    label: "操作",
    align: "left",
    prop: "opreate",
    minWidth: 120,
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
</script>

<template>
  <el-card shadow="never">
    <pure-table :data="taskData" :columns="taskColumns">
      <
      <template #opreate="{ row }">
        <el-button link size="small">
          <el-icon :size="20">
            <RefreshRight />
          </el-icon>
        </el-button>
        <el-button link size="small">
          <el-icon :size="20" color="#333333"><InfoFilled /></el-icon>
        </el-button>
        <el-button circle size="small">
          <el-icon>
            <Delete />
          </el-icon>
        </el-button>
        <el-button size="small" link>
          <el-icon :size="20"><VideoPause /></el-icon>
        </el-button>

        <el-button circle size="small" @click="gotoDetail(row.type, row.id)">
          <DetailIcon />
        </el-button>
      </template>
    </pure-table>
    <div class="pt-[15px]">
      <el-pagination align="center" :current-page="current_page" :page-size="page_size" layout="total, prev, pager, next, jumper" :total="task_count" @current-change="handleCurrentChange" />
    </div>
  </el-card>
</template>

<style lang="scss" scoped></style>
