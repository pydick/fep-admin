<script setup lang="ts">
defineOptions({
  name: "CStab"
});
import { ref, defineEmits, computed } from "vue";

import type { TabsPaneContext } from "element-plus";

interface Props {
  tabList?: { label: string; name: string }[];
  type?: "border-card" | "card" | "";
  activeName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "border-card",
  tabList: () => [
    { label: "label1", name: "first" },
    { label: "label12", name: "second" }
  ],
  activeName: ""
});
const activeName = ref(props.activeName);
const emit = defineEmits<{
  (e: "tabClcik", value: string): void;
  (e: "update:activeName", value: string): void;
}>();

const innerActiveName = computed({
  get: () => props.activeName,
  set: (value: string) => {
    emit("update:activeName", value);
  }
});

const handleClick = (tab: TabsPaneContext, event: Event) => {
  emit("tabClcik", tab.props.name as string);
};
</script>

<template>
  <el-tabs v-model="innerActiveName" addable :type="type" class="h-full cs-tabs tab-container" @tab-click="handleClick">
    <template v-if="$slots.addIcon" #add-icon>
      <slot name="addIcon" />
    </template>
    <el-tab-pane v-for="item in tabList" :key="item.name" :label="item.label" :name="item.name">
      <slot :name="item.name" />
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
:deep(.el-tab-pane) {
  height: 100%;
}
.tab-container {
  position: relative;
}
:deep(.el-tabs__new-tab) {
  width: auto !important;
}
</style>
