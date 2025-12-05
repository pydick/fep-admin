<script setup lang="ts">
import { ref, watch, inject } from "vue";
import PerturbationGraph from "@/views/inno-fep/components/PerturbationGraph/index.vue";
import MappingGraph from "./MappingGraph/index.vue";
import BlcokTitle from "@/views/inno-fep/components/BlcokTitle/index.vue";
import { prepareLigand } from "@/api/fep";
import { useTaskStoreHook } from "@/store/modules/task";
import { ElMessage, ElLoading } from "element-plus";
const excludeEdges = inject<any>("excludeEdges");
defineOptions({
  name: "PerturbationGraphDialog"
});
interface Props {
  visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  visible: false
});

const edgeData = ref<any>(null);
const perturbationGraphRef = ref<any>(null);
const perGraphParams = inject<any>("perGraphParams");
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();

const hasEdit = ref(false);

// 检查图的连通性：所有节点必须在同一个连通分量中
const checkGraphConnectivity = (nodes: any[], edges: any[]): boolean => {
  // 空图或单节点图视为连通
  if (nodes.length <= 1) return true;

  // 如果没有边，但节点数大于1，则不连通
  if (edges.length === 0 && nodes.length > 1) return false;

  // 构建无向图的邻接表
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });

  // 添加边（无向图，双向连接）
  edges.forEach(edge => {
    const source = edge.source;
    const target = edge.target;
    if (adjacencyList.has(source)) {
      adjacencyList.get(source)!.push(target);
    }
    if (adjacencyList.has(target)) {
      adjacencyList.get(target)!.push(source);
    }
  });

  // 使用 DFS 遍历，检查是否能访问所有节点
  const visited = new Set<string>();
  const startNode = nodes[0].id;

  const dfs = (nodeId: string) => {
    visited.add(nodeId);
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  };

  // 从第一个节点开始DFS
  dfs(startNode);

  // 如果访问的节点数等于总节点数，说明所有节点都在一个连通分量中
  return visited.size === nodes.length;
};

const handleSure = async () => {
  // 如果用户编辑了图，需要校验连通性
  if (hasEdit.value) {
    const allNodes = perturbationGraphRef.value?.getAllNodeData() ?? [];
    const allEdges = perturbationGraphRef.value?.getAllEdgeData() ?? [];

    if (!checkGraphConnectivity(allNodes, allEdges)) {
      ElMessage.warning("微扰图必须完整连接，所有节点都需要有连接，不能存在孤立节点或多个不连通的节点组");
      return;
    }
  }
  perGraphParams.value = {
    step: 2,
    use_user_defined_map_flag: hasEdit.value,
    user_pair_list: hasEdit.value ? (perturbationGraphRef.value?.getAllEdgeData().map(item => [item.source, item.target]) ?? []) : []
  };
  console.log(1111, excludeEdges.value);
  excludeEdges.value.isNeedRemind = true;
  emit("update:visible", false);
};
const handleCancel = () => {
  excludeEdges.value.isNeedRemind = true;
  emit("update:visible", false);
};
const handleEdgeChange = (value: any) => {
  edgeData.value = value;
};
</script>

<template>
  <el-dialog id="perGraphDialog" v-model="props.visible" :close-on-click-modal="false" :show-close="false" title="配体微扰图" class="per-graph-dialog" header-class="pb-[0px]!">
    <el-row :gutter="15" class="h-full">
      <el-col :span="12" class="h-full">
        <BlcokTitle title="微扰图" class="pb-[15px]" />
        <div class="perturbation-container h-full">
          <PerturbationGraph ref="perturbationGraphRef" v-model:hasEdit="hasEdit" class="pt-[15px] h-[600px]!" :isSelectedFirstEdge="true" @edgeChange="handleEdgeChange" />
        </div>
      </el-col>
      <el-col :span="12" class="h-full">
        <BlcokTitle title="映射图" class="pb-[15px]" />
        <MappingGraph :edgeData="edgeData" />
      </el-col>
    </el-row>
    <template #footer>
      <div>
        <!-- <el-button @click="handleCancel">取消</el-button> -->
        <el-button type="primary" @click="handleSure">校验</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
<style lang="scss">
.per-graph-dialog {
  width: 70%;
  @media (min-width: 1520px) {
    width: 60%;
  }
}
</style>
