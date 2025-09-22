<template>
  <div
    style="width: 1.5rem; height: 1.5rem"
    class="molstar_btn"
    :class="{ disable_btn: props.disabled }"
    :title="props.title"
  >
    <molstar_svg :name="props.svg_name" width="16px" height="16px" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import molstar_svg from "@/components/molecule/molstar_svg.vue";

const props = defineProps({
  svg_name: {
    type: String,
    default: "full_screen"
  },
  title: {
    type: String,
    default: "Full Screen"
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineExpose({
  props
});
</script>

<style scoped lang="scss">
.disable_btn {
  color: #777;
  cursor: not-allowed;
  opacity: 0.5;
}

.molstar_bg {
  background: #eeece7;
  opacity: 0.5;
}

.molstar_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f3f0;
  border: none;
}

.molstar_btn:hover {
  color: #ae5d04 !important;
  cursor: pointer;
  outline: 1px solid #c9c3b3 !important;
}

.disable_btn:hover {
  cursor: not-allowed !important;
}
</style>
