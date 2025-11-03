<template>
  <div class="relative flex justify-evenly items-center text-[#333] text-[0.8rem]" :style="{ width: width, height: height }">
    <el-skeleton :style="{ width: width }" :loading="loading" animated>
      <template #template>
        <el-skeleton-item variant="image" :style="{ width: width, height: height }" />
      </template>
      <div v-if="if_svg && !if_broken_smiles" :style="{ width: width, height: height }" v-html="svg" />
      <p v-else class="text-center w-20 m-2.5">{{ placeholder }}</p>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { svgdraw } from "@/api/fep";

const props = defineProps({
  smiles: {
    type: String,
    default: "C1=CCC(c2cccc(-c3ccccc3)c2)=C1"
  },
  width: {
    type: String,
    default: "auto"
  },
  height: {
    type: String,
    default: "auto"
  },
  smarts: {
    type: String,
    default: ""
  },
  if_wait: {
    type: Boolean,
    default: false
  },
  if_atom_index: {
    type: Boolean,
    default: false
  },
  bond_width: {
    type: Number,
    default: 2
  },
  loading: {
    type: Boolean,
    default: false
  },
  if_smarts: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: "draw svg failed"
  }
});

const svg = ref("");
const if_svg = ref(false);
const request_cpld = ref(false);
const if_broken_smiles = ref(false);
const placeholder = ref("Waiting...");

const check_smiles = smiles => {
  if (smiles.includes("v2000") || smiles.includes("v3000") || smiles.includes("V2000") || smiles.includes("V3000")) {
    return true;
  }
  // 如果存在三个及以上'.'，则认为smiles不合法
  if (smiles.split(".").length > 3) {
    return false;
  }
  return true;
};

const draw_by_rdkit_end = () => {
  if (!check_smiles(props.smiles)) {
    if_broken_smiles.value = true;
    placeholder.value = "蛋白配体键预测失败，无法2D展示";
    return;
  }
  const defaultWidth = 400;
  const defaultHeight = 400;
  const data = {
    smiles: props.smiles,
    width: defaultWidth,
    height: defaultHeight
  };
  svgdraw(data)
    .then(res => {
      let s = res;
      s = s.replace(new RegExp(`${defaultWidth}px`, "g"), props.width);
      s = s.replace(new RegExp(`${defaultHeight}px`, "g"), props.height);
      s = s.replace(/opacity:1.0/g, "opacity:0");
      svg.value = s;
      if_svg.value = true;
    })
    .catch(err => {
      console.error(err);
      if_svg.value = false;
      placeholder.value = props.error;
    });
};

watch(
  () => [props.smiles, props.smarts, props.width, props.error],
  () => {
    draw_by_rdkit_end();
  }
);

onMounted(() => {
  draw_by_rdkit_end();
});
</script>

<style lang="css" scoped></style>
