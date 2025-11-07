<script setup lang="ts">
import SvgBox from "@/components/CSsvgbox/index.vue";
import { mappingList } from "./data";
import { ref, computed } from "vue";
defineOptions({
  name: "MappingGraph"
});

interface Props {
  edgeId?: string | null;
}
const props = withDefaults(defineProps<Props>(), {
  edgeId: null
});

const mappingData = computed(() => {
  return mappingList[props.edgeId] || {};
});
</script>

<template>
  <el-row>
    <el-col :span="12">
      <div class="mapping-item">
        <el-text class="mx-1" size="large">{{ mappingData.name1 }}</el-text>
        <SvgBox width="200px" height="auto" :smiles="mappingData.smiles1" />
        <el-text class="mx-1" size="large">{{ mappingData.name2 }}</el-text>
      </div>
    </el-col>
    <el-col :span="12">
      <div class="mapping-item">
        <el-text class="mx-1" size="large">{{ mappingData.name3 }}</el-text>
        <SvgBox width="200px" height="auto" :smiles="mappingData.smiles2" />
        <el-text class="mx-1" size="large">{{ mappingData.name4 }}</el-text>
      </div>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.mapping-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  width: 100%;
}
</style>
