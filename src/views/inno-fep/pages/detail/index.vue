<script setup lang="ts">
import preturbationGraph from "@/views/inno-fep/components/PerturbationGraph/index.vue";
import BlcokTitle from "@/views/inno-fep/components/BlcokTitle/index.vue";
import Ligand3d from "@/views/inno-fep/components/Ligand3d/index.vue";
import CStab from "@/components/CStab/index.vue";
import Pairs from "./Pairs/index.vue";
import Ligand from "./Ligand/index.vue";
import { ref, reactive } from "vue";
defineOptions({
  name: "Inno-Fep-Detail"
});
const tabList = reactive([
  { label: "Pairs", name: "Pairs" },
  { label: "Ligand", name: "Ligand" }
]);
const activeName = ref(tabList[1].name);
</script>

<template>
  <div class="detail-container w-full h-full p-[15px]">
    <el-row :gutter="15" class="h-full">
      <el-col :span="12">
        <div class="left-container h-full">
          <div class="left-block1 h-[110px]" />
          <div class="left-block2 pt-[15px]">
            <CStab v-model:activeName="activeName" :tabList="tabList">
              <template #Pairs>
                <Pairs />
              </template>
              <template #Ligand>
                <Ligand />
              </template>
            </CStab>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="right-container h-full">
          <div class="right-block1 h-[110px]" />
          <div class="right-block2 h-[calc(100%-110px)]!">
            <div v-if="activeName === 'Pairs'" class="h-full">
              <BlcokTitle title="微扰图" class="pb-[15px]">
                <div class="inline-block flex-1 text-right">
                  <el-button type="primary">生成</el-button>
                </div>
              </BlcokTitle>
              <div class="h-[calc(100%-62px)]!">
                <preturbationGraph />
              </div>
            </div>
            <div v-if="activeName === 'Ligand'" class="h-full">
              <BlcokTitle title="Pocket Viewer" class="pb-[15px]">
                <div class="inline-block flex-1 text-right">
                  <el-button type="primary">生成</el-button>
                </div>
              </BlcokTitle>
              <div class="h-[calc(100%-62px)]!">
                <Ligand3d ref="ligand3dRef" class="h-full" />
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.detail-container {
  background: #fff;
  .left-container {
    display: flex;
    flex-direction: column;
    .left-block1 {
      background-color: #f0f2f5;
    }
    .left-block2 {
      flex: 1;
    }
  }
  .right-container {
    display: flex;
    flex-direction: column;
    .right-block1 {
      background-color: #f0f2f5;
    }
    .right-block2 {
      flex: 1;
    }
  }
}
</style>
