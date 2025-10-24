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
  <p class="pt-[15px] m-[0px]! flex align-center">
    <span class="label_1 inline-block">
      {{ props.title }}
    </span>
    <slot />
  </p>
</template>

<style lang="scss" scoped>
.label_1 {
  width: auto;
  height: 30px;
  line-break: 30px !important;
  border-left: #0160ee solid 5px;
  padding-left: 10px;
  font-size: 18px;
  font-weight: bold;
  align-items: center;
  margin: 0;
}
</style>
