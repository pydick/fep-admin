<script setup lang="ts">
defineOptions({
  name: "CStab"
});
import { ref, defineEmits } from "vue";

import type { TabsPaneContext } from "element-plus";

interface Props {
  tabList?: { label: string; name: string }[];
  type?: "border-card" | "card" | "";
}

const props = withDefaults(defineProps<Props>(), {
  type: "border-card",
  tabList: () => [
    { label: "label1", name: "first" },
    { label: "label12", name: "second" }
  ]
});
const activeName = ref(props.tabList[0].name);
const emit = defineEmits(["tabClcik"]);
const handleClick = (tab: TabsPaneContext, event: Event) => {
  emit("tabClcik", tab.props.name);
};
</script>

<template>
  <el-tabs v-model="activeName" :type="type" class="h-full cs-tabs" @tab-click="handleClick">
    <el-tab-pane v-for="item in tabList" :key="item.name" :label="item.label" :name="item.name">
      <slot :name="item.name" />
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
:deep(.el-tab-pane) {
  height: 100%;
}
</style>
