<script setup lang="ts">
import { ref, computed } from "vue";
defineOptions({
  name: "FilterColumn"
});

interface CheckItem {
  ischecked: boolean;
  label: string;
}

const checkedList = ref<CheckItem[]>([
  {
    ischecked: false,
    label: "Smiles"
  },
  {
    ischecked: false,
    label: "Smiles1"
  }
]);

// 计算已选中的数量
const checkedCount = computed(() => {
  return checkedList.value.filter(item => item.ischecked).length;
});

// 计算全选状态
const checkAll = computed({
  get: () => checkedCount.value === checkedList.value.length && checkedList.value.length > 0,
  set: (val: boolean) => {
    checkedList.value.forEach(item => {
      item.ischecked = val;
    });
  }
});

// 计算半选状态
const isIndeterminate = computed(() => {
  return checkedCount.value > 0 && checkedCount.value < checkedList.value.length;
});

// 全选/取消全选处理
const handleCheckAllChange = (val: boolean) => {
  checkAll.value = val;
};
</script>

<template>
  <div class="filter-column-container">
    <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" label="全选" size="large" class="ml-[15px]!" @change="handleCheckAllChange" />
    <div class="column-list">
      <div v-for="item in checkedList" :key="item.label" class="column-item">
        <el-checkbox v-model="item.ischecked" :label="item.label" size="large" class="ml-[15px]!" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-column-container {
}
</style>
