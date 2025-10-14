<script setup lang="ts">
import { ref } from "vue";
import type { CollapseModelValue } from "element-plus";
defineOptions({
  name: "CScollapse"
});
interface Props {
  collapseList?: { title: string; name: string }[];
}

const props = withDefaults(defineProps<Props>(), {
  collapseList: () => [
    { title: "Consistency", name: "1" },
    { title: "Feedback", name: "2" },
    { title: "Efficiency", name: "3" },
    { title: "Controllability", name: "4" }
  ]
});

const nameList = props.collapseList.map(item => item.name);
const activeNames = ref(nameList);
const handleChange = (val: CollapseModelValue) => {
  console.log(val);
};
</script>

<template>
  <el-collapse v-model="activeNames" @change="handleChange">
    <el-collapse-item v-for="item in collapseList" :key="item.name" :title="item.title" :name="item.name">
      <template v-if="$slots.title" #title>
        <slot name="title" />
      </template>
      <slot :name="item.name" />
    </el-collapse-item>
  </el-collapse>
</template>

<style lang="scss" scoped></style>
