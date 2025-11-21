<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import Csdialog from "@/components/Csdialog/index.vue";
import { Search } from "@element-plus/icons-vue";

defineOptions({
  name: "Adapt"
});

interface Props {
  // 对话框显示状态
  visible?: boolean;
  // 药物名称
  drugName?: string;
  // 适应症数据
  indications?: Array<{ id: string; name: string }>;
  // 最大选择数量
  maxSelect?: number;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  drugName: "氘可来昔替尼",
  indications: () => [
    { id: "ind1", name: "自身免疫性疾病" },
    { id: "ind2", name: "肝病" },
    { id: "ind3", name: "肾脏疾病" },
    { id: "ind4", name: "银屑病" },
    { id: "ind5", name: "溃疡性结肠炎" },
    { id: "ind6", name: "克罗恩病" },
    { id: "ind7", name: "系统性红斑狼疮" },
    { id: "ind8", name: "斑块状银屑病" },
    { id: "ind9", name: "银屑病关节炎" },
    { id: "ind10", name: "狼疮性肾炎" },
    { id: "ind11", name: "类风湿性关节炎" },
    { id: "ind12", name: "强直性脊柱炎" },
    { id: "ind13", name: "干燥综合征" },
    { id: "ind14", name: "硬皮病" },
    { id: "ind15", name: "多发性肌炎" },
    { id: "ind16", name: "皮肌炎" }
  ],
  maxSelect: 200
});

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "confirm", selectedIds: string[]): void;
}>();

// 使用 computed 处理 v-model
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit("update:visible", value);
  }
});

// 监听 visible 变化，打开时重置状态（如果没有通过 openDialog 传入初始值）
let isOpeningWithInitial = false;
watch(
  () => props.visible,
  newVal => {
    if (newVal && !isOpeningWithInitial) {
      // 对话框打开时重置状态
      selectedIndications.value = [];
      searchKeyword.value = "";
    }
    isOpeningWithInitial = false;
  }
);

// 对话框配置
const dialogConfig = reactive({
  title: "选择适应症",
  width: "600px",
  closeOnClickModal: false,
  showClose: true
});

// 搜索关键词
const searchKeyword = ref("");

// 选中的适应症ID列表
const selectedIndications = ref<string[]>([]);

// 过滤后的适应症列表
const filteredIndications = computed(() => {
  if (!searchKeyword.value) {
    return props.indications;
  }
  return props.indications.filter(item => item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()));
});

// 全部数量
const totalCount = computed(() => props.indications.length);

// 已选择数量
const selectedCount = computed(() => selectedIndications.value.length);

// 是否全选（基于过滤后的列表）
const isSelectAll = computed({
  get: () => {
    if (filteredIndications.value.length === 0) return false;
    return filteredIndications.value.every(item => selectedIndications.value.includes(item.id));
  },
  set: (value: boolean) => {
    if (value) {
      // 全选：添加所有过滤后的项目（不超过最大选择数）
      filteredIndications.value.forEach(item => {
        if (!selectedIndications.value.includes(item.id) && selectedIndications.value.length < props.maxSelect) {
          selectedIndications.value.push(item.id);
        }
      });
    } else {
      // 取消全选：移除所有过滤后的项目
      filteredIndications.value.forEach(item => {
        const index = selectedIndications.value.indexOf(item.id);
        if (index > -1) {
          selectedIndications.value.splice(index, 1);
        }
      });
    }
  }
});

// 打开对话框（保留方法以支持通过 ref 调用）
const openDialog = (initialSelected?: string[]) => {
  if (initialSelected) {
    isOpeningWithInitial = true;
    selectedIndications.value = [...initialSelected];
  }
  emit("update:visible", true);
};

// 关闭对话框
const closeDialog = () => {
  emit("update:visible", false);
};

// 确认选择
const confirmSelection = () => {
  emit("confirm", [...selectedIndications.value]);
  closeDialog();
};

// 处理单个复选框变化
const handleCheckboxChange = (checked: boolean, itemId: string) => {
  if (checked) {
    if (selectedIndications.value.length >= props.maxSelect) {
      // 达到最大选择数，不允许继续选择
      return;
    }
    if (!selectedIndications.value.includes(itemId)) {
      selectedIndications.value.push(itemId);
    }
  } else {
    const index = selectedIndications.value.indexOf(itemId);
    if (index > -1) {
      selectedIndications.value.splice(index, 1);
    }
  }
};

// 暴露方法供父组件调用
defineExpose({
  openDialog
});
</script>

<template>
  <Csdialog v-model:visible="dialogVisible" :config="dialogConfig">
    <div class="adapt-dialog">
      <!-- 头部信息 -->
      <div class="dialog-header">
        <div class="header-top">
          <span class="drug-name">{{ drugName }}</span>
          <span class="total-count">全部 {{ totalCount }}</span>
        </div>
        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="请输入名字并搜索" clearable class="search-input">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="dialog-content">
        <div class="content-list">
          <!-- 一键全选 -->
          <div class="list-item select-all-item">
            <el-checkbox v-model="isSelectAll" :disabled="filteredIndications.length === 0">一键全选</el-checkbox>
          </div>

          <!-- 适应症列表 -->
          <el-scrollbar class="scrollbar-wrapper">
            <el-checkbox-group v-model="selectedIndications" class="checkbox-group">
              <div v-for="item in filteredIndications" :key="item.id" class="list-item">
                <el-checkbox :label="item.id" :disabled="!selectedIndications.includes(item.id) && selectedIndications.length >= maxSelect" @change="(val: boolean) => handleCheckboxChange(val, item.id)">
                  {{ item.name }}
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </el-scrollbar>
        </div>
      </div>

      <!-- 底部 -->
      <div class="dialog-footer">
        <div class="footer-left">
          <span class="selected-count">已选择适应症: {{ selectedCount }}/{{ totalCount }}</span>
        </div>
        <div class="footer-right">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="confirmSelection">确定</el-button>
        </div>
      </div>
    </div>
  </Csdialog>
</template>

<style lang="scss" scoped>
.adapt-dialog {
  .dialog-header {
    margin-bottom: 20px;

    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .drug-name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .total-count {
        font-size: 14px;
        color: #666;
      }
    }

    .search-box {
      .search-input {
        width: 100%;
      }
    }
  }

  .dialog-content {
    .content-list {
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      overflow: hidden;

      .select-all-item {
        padding: 12px 16px;
        background-color: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;

        :deep(.el-checkbox) {
          font-weight: 500;
        }
      }

      .scrollbar-wrapper {
        max-height: 400px;
        overflow-y: auto;

        .checkbox-group {
          width: 100%;

          .list-item {
            padding: 12px 16px;
            border-bottom: 1px solid #f0f0f0;
            transition: background-color 0.2s;

            &:hover {
              background-color: #f5f7fa;
            }

            &:last-child {
              border-bottom: none;
            }

            :deep(.el-checkbox) {
              width: 100%;

              .el-checkbox__label {
                width: 100%;
                padding-left: 8px;
              }
            }
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    margin-top: 20px;
    border-top: 1px solid #e4e7ed;

    .footer-left {
      .selected-count {
        font-size: 14px;
        color: #666;
      }
    }

    .footer-right {
      display: flex;
      gap: 12px;
    }
  }
}
</style>
