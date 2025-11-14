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
  <div>
    <el-row v-if="props.edgeId">
      <el-col :span="24">
        <div class="flex-bc px-[30px] pb-[15px]">
          <el-text class="mx-1 flex-1 text-center" size="large">Mapping score：{{ mappingData.name1 }}</el-text>
          <el-text class="mx-1 flex-1 text-center" size="large">Similarity score: {{ mappingData.name3 }}</el-text>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="mapping-item">
          <SvgBox width="200px" height="auto" :smiles="mappingData.smiles1" />
          <el-text class="mx-1" size="large">{{ mappingData.name2 }}</el-text>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="mapping-item">
          <SvgBox width="200px" height="auto" :smiles="mappingData.smiles2" />
          <el-text class="mx-1" size="large">{{ mappingData.name4 }}</el-text>
        </div>
      </el-col>
    </el-row>
    <div v-else class="text-center py-[100px] text-gray-500 h-[260px]">暂无数据</div>
  </div>
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
