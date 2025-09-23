<template>
  <div style="position: relative" class="flex_def text_c3 text08rem" :style="{ width: width, height: height }">
    <el-skeleton :style="{ width: width }" :loading="loading" animated>
      <template #template>
        <el-skeleton-item variant="image" :style="{ width: width, height: height }" />
      </template>
      <div v-if="if_svg && !if_broken_smiles" :style="{ width: width, height: height }" v-html="svg" />
      <p v-else style="text-align: center; width: 80px; margin: 10px">{{ placeholder }}</p>
    </el-skeleton>
  </div>
</template>

<script>
import { ref, toRefs, watch } from "vue";
import { draw_api } from "@drugflow/api/common.js";

export default {
  name: "svgBox",
  components: {},
  props: {
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
  },
  setup(props, context) {
    const svg = ref("");
    const if_svg = ref(false);
    const request_cpld = ref(false);
    const if_broken_smiles = ref(false);
    const placeholder = ref("Waiting...");
    const smiles = toRefs(props).smiles;
    const smarts = toRefs(props).smarts;
    const width = toRefs(props).width;
    const height = toRefs(props).height;
    const error = toRefs(props).error;

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
      if (!check_smiles(smiles.value)) {
        if_broken_smiles.value = true;
        placeholder.value = "蛋白配体键预测失败，无法2D展示";
        return;
      }
      const formdata = new FormData();
      formdata.append("smiles", smiles.value);
      const config = {
        smarts: smarts.value,
        bond_width: props.bond_width,
        show_index: props.if_atom_index
      };
      formdata.append("config", JSON.stringify(config));
      draw_api(formdata)
        .then(res => {
          let s = res;
          s = s.replace(/250px/g, width.value);
          s = s.replace(/200px/g, height.value);
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

    watch([smiles, smarts, width, error], () => {
      draw_by_rdkit_end();
    });

    return {
      svg,
      if_svg,
      request_cpld,
      if_broken_smiles,
      placeholder,
      draw_by_rdkit_end
    };
  },
  mounted() {
    this.draw_by_rdkit_end();
  },
  methods: {}
};
</script>

<style lang="css" scoped></style>
