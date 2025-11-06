<script setup lang="ts">
import FileRow from "@/views/inno-fep/components/FileRow/index.vue";
import Ligand3d from "@/views/inno-fep/components/Ligand3d/index.vue";
import BlcokTitle from "@/views/inno-fep/components/BlcokTitle/index.vue";
defineOptions({
  name: "AnalysisDetail"
});
</script>

<template>
  <div class="analysis-detail-container w-full h-full p-[15px]">
    <el-row :gutter="15" class="h-full">
      <el-col :span="12">
        <div>aaa</div>
      </el-col>
      <el-col :span="12">
        <div class="right-container h-full">
          <div class="right-block2 h-full">
            <div class="h-full">
              <BlcokTitle title="Pocket Viewer" class="pb-[15px]">
                <FileRow />
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
.analysis-detail-container {
  background: #fff;
  .right-container {
    display: flex;
    flex-direction: column;
    .right-block1 {
      background-color: #f0f2f5;
    }
    .right-block {
      flex: 1;
    }
  }
}
</style>
