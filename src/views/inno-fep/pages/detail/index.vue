<script setup lang="ts">
import preturbationGraph from "@/views/inno-fep/components/PerturbationGraph/index.vue";
import BlcokTitle from "@/views/inno-fep/components/BlcokTitle/index.vue";
import Ligand3d from "@/views/inno-fep/components/Ligand3d/index.vue";
import CStab from "@/components/CStab/index.vue";
import Pairs from "./Pairs/index.vue";
import Ligand from "./Ligand/index.vue";
import { ref, reactive, onMounted } from "vue";
import { Filter, Setting } from "@element-plus/icons-vue";
import FilterDrawer from "./FilterDrawer/index.vue";
import { mockData1 } from "./data";
import FilterColumn from "./FilterColumn/index.vue";
import CarbonTextLinkAnalysis from "~icons/carbon/text-link-analysis";
import StreamlineCodeAnalysis from "~icons/streamline/code-analysis";
import FileRow from "@/views/inno-fep/components/FileRow/index.vue";
import Csdialog from "@/components/Csdialog/index.vue";
import CorrelationEcharts from "./CorrelationEcharts/index.vue";
defineOptions({
  name: "Inno-Fep-Detail"
});
const tabList = reactive([
  { label: "Pairs", name: "Pairs" },
  { label: "Ligand", name: "Ligand" }
]);
const activeName = ref(tabList[0].name);
const isCollect = ref(false);
const if_show_filter = ref(false);
const histogram_data_all = ref([]);
const cascadOptions = ref([]);
const score_name_dict = {
  vina: "Vina",
  vina_gpu: "Vina",
  IGN: "IGN",
  RTMS: "RTMScore",
  vinardo: "Vinardo",
  plp: "Plp",
  chemplp: "ChemPlp",
  plp95: "Plp95",
  ad4: "AutoDock 4",
  carsidock: "CarsiScore",
  karmadock: "KarmaScore"
};
const default_list = ref([]);
const residue_list = ref([]);

const change_table_filter = dict => {
  console.log("change_table_filter");
};

const correlationAnalysis = () => {
  analysisShow.value = true;
  console.log("相关性分析");
};
const resultAnalysis = () => {
  console.log("结果分析");
};

const analysisShow = ref(false);
const analysisConfig = reactive({
  title: "相关性分析",
  width: "40%",
  height: "40%"
});
onMounted(() => {
  histogram_data_all.value = mockData1.compute.aggregations.histogram;
  for (let i = 0; i < mockData1.compute.aggregations.histogram?.residues.length; i++) {
    residue_list.value.push({
      id: i,
      name: mockData1.compute.aggregations.histogram.residues[i],
      selected: false
    });
  }
  Object.keys(mockData1.compute.aggregations.histogram).map(key => {
    if (key !== "residues") {
      default_list.value.push(key);
      if (key === "affinity") {
        cascadOptions.value.push({
          value: key,
          label: score_name_dict[mockData1.args.docking.scoring_function]
        });
      } else {
        cascadOptions.value.push({
          value: key,
          label: score_name_dict[key]
        });
      }
    }
  });
});
</script>

<template>
  <div class="detail-container w-full h-full p-[15px]">
    <el-row :gutter="15" class="h-full">
      <el-col :span="12">
        <div class="left-container h-full">
          <BlcokTitle title="分析列表">
            <div class="flex-1 flex items-center justify-end">
              <el-tooltip content="相关性分析" placement="top">
                <el-icon :size="20" class="icon-hover mr-[15px]" @click="correlationAnalysis()">
                  <CarbonTextLinkAnalysis />
                </el-icon>
              </el-tooltip>
              <el-tooltip content="结果分析" placement="top">
                <el-icon :size="20" class="icon-hover" @click="resultAnalysis()">
                  <StreamlineCodeAnalysis />
                </el-icon>
              </el-tooltip>
            </div>
          </BlcokTitle>
          <div class="left-block2 pt-[15px]">
            <CStab v-model:activeName="activeName" :tabList="tabList">
              <template #Pairs><Pairs /></template>
              <template #Ligand><Ligand /></template>
              <template #addIcon>
                <div class="extra-container">
                  <el-tooltip content="高级筛选" placement="top">
                    <el-icon :size="20" @click="if_show_filter = !if_show_filter">
                      <Setting />
                    </el-icon>
                  </el-tooltip>
                  <el-tooltip content="显示/隐藏列" placement="top">
                    <span class="ml-[15px]! leading-1 top-[1px] relative">
                      <el-popover placement="bottom" :width="200" trigger="click">
                        <template #reference>
                          <el-icon :size="20"><Filter /></el-icon>
                        </template>
                        <template #default><FilterColumn /></template>
                      </el-popover>
                    </span>
                  </el-tooltip>
                  <el-checkbox v-model="isCollect" label="收藏" size="large" class="ml-[15px]!" />
                </div>
              </template>
            </CStab>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="right-container h-full">
          <div class="right-block">
            <div v-if="activeName === 'Pairs'" class="h-full">
              <BlcokTitle title="微扰图" class="pb-[15px]">
                <FileRow />
              </BlcokTitle>
              <div class="h-[calc(100%-62px)]!">
                <preturbationGraph />
              </div>
            </div>
            <div v-if="activeName === 'Ligand'" class="h-full">
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
    <FilterDrawer v-model:if_show="if_show_filter" :array="histogram_data_all" :cascadOptions="cascadOptions" :need_cascad="false" :default_list="default_list" :residue_list="residue_list" data_type="docking" @change_table_for_filter="change_table_filter" />
    <Csdialog v-model:visible="analysisShow" :config="analysisConfig">
      <CorrelationEcharts />
    </Csdialog>
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
    .right-block {
      flex: 1;
    }
  }
}
.extra-container {
  position: absolute;
  right: 0;
  top: 0;
  // width: 200px;
  height: 40px;
  display: flex;
  align-items: center;
  padding-right: 15px;
}
</style>
