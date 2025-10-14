<script setup lang="ts">
defineOptions({
  name: "CScard"
});
interface Props {
  shadow?: "always" | "hover" | "never";
}

const props = withDefaults(defineProps<Props>(), {
  shadow: "always"
});
</script>

<template>
  <el-card class="flex-1 flex flex-col" body-class="flex-1" :shadow="shadow">
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <slot name="content" />
  </el-card>
</template>

<style lang="scss" scoped></style>
