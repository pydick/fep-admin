<script setup lang="ts">
defineOptions({
  name: "BlcokTitle"
});

interface Props {
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "title"
});
</script>

<template>
  <p class="label_1">
    {{ props.title }}
    <slot />
  </p>
</template>

<style lang="scss" scoped>
.label_1 {
  width: 100%;
  height: 30px;
  border-left: #0160ee solid 5px;
  padding-left: 10px;
  margin: 15px 0 0 0;
  font-size: 18px;
  display: flex;
  align-items: flex-start;
  font-weight: bold;
}
</style>
