<script setup lang="ts">
import { onMounted, ref, onUnmounted, reactive, h, nextTick, defineEmits } from "vue";
import { Graph, GraphOptions, NodeOptions, EdgeOptions } from "@antv/g6";
import GraphNode from "./components/GraphNode/index.vue";
import { throttle } from "@pureadmin/utils";
import { pxToRemPx } from "@/utils/rem";
import { cloneDeep } from "@pureadmin/utils";
import { ElMessage } from "element-plus";
import { getPerturbationGraphData } from "@/api/fep";

import { register, ExtensionCategory } from "@antv/g6";
import { CustomToolbarPlugin } from "./plugins/CustomToolbarPlugin/index";
register(ExtensionCategory.PLUGIN, "custom-toolbar", CustomToolbarPlugin);
defineOptions({
  name: "PerturbationGraph"
});
let graph: Graph | null = null;

const containerRef = ref<HTMLElement>();

const currentHighlightedEdge = ref<string | null>(null);

interface Iprops {
  isDialogEnter?: boolean;
  isSelectedFirstEdge?: boolean;
  width?: string;
  height?: string;
}

const sourceNodeId = ref<string | null>(null);
const props = withDefaults(defineProps<Iprops>(), {
  isDialogEnter: false,
  isSelectedFirstEdge: false,
  width: "500px",
  height: "500px"
});

const emit = defineEmits<{
  (e: "edgeChange", value: string): void;
}>();

const unitRadius = ref(0);
// 当前数据改为响应式
const graphData = reactive({
  nodes: [],
  edges: []
});
// 用于保存初始数据快照（用于重置）
let initialGraphData = {
  nodes: [],
  edges: []
};

const edgeCount = ref(0);

const plugins = reactive([
  {
    type: "toolbar",
    getItems: () => [
      { id: "zoom-in", value: "zoom-in" },
      { id: "zoom-out", value: "zoom-out" },
      { id: "auto-fit", value: "auto-fit" },
      { id: "reset", value: "reset" }
    ],
    onClick: value => {
      // 放大操作
      if (value === "zoom-in") {
        const currentZoom = graph.getZoom(); // 获取当前缩放比例
        const zoomFactor = 1.1; // 放大倍数（每次放大10%）
        const maxZoom = 1.6; // 最大缩放限制（160%）
        const newZoom = currentZoom * zoomFactor; // 计算放大后的新缩放值

        // 如果放大后会超过最大限制
        if (newZoom > maxZoom) {
          // 如果当前已经达到或超过最大缩放，则不执行任何操作
          if (currentZoom >= maxZoom) {
            return;
          }
          // 否则，计算并应用刚好达到最大缩放的缩放比例
          const targetZoom = maxZoom / currentZoom;
          graph.zoomBy(targetZoom);
        } else {
          // 如果放大后仍在限制范围内，正常放大
          graph.zoomBy(zoomFactor);
        }
      }
      // 缩小操作
      else if (value === "zoom-out") {
        const currentZoom = graph.getZoom(); // 获取当前缩放比例
        const zoomFactor = 0.9; // 缩小倍数（每次缩小10%）
        const minZoom = 0.8; // 最小缩放限制（80%）
        const newZoom = currentZoom * zoomFactor; // 计算缩小后的新缩放值

        // 如果缩小后仍在最小限制之上
        if (newZoom >= minZoom) {
          // 正常缩小
          graph.zoomBy(zoomFactor);
        } else {
          // 如果缩小后会低于最小限制
          // 如果当前已经达到或低于最小缩放，则不执行任何操作
          if (currentZoom <= minZoom) {
            return;
          }
          // 否则，计算并应用刚好达到最小缩放的缩放比例
          const targetZoom = minZoom / currentZoom;
          graph.zoomBy(targetZoom);
        }
      } else if (value === "auto-fit") {
        graph.fitCenter();
      } else if (value === "reset") {
        currentHighlightedEdge.value = null;
        graph.setData(initialGraphData);
        graph.zoomTo(1);
        graph.render();
        edgeCount.value = initialGraphData.edges.length;
      }
    }
  },
  {
    type: "contextmenu",
    enable: e => e.targetType === "edge",
    getItems: () => {
      return [{ name: "断开连接", value: "disconnect" }];
    },
    onClick: (value, target, current) => {
      if (!graph || !target || !current) return;
      if (value === "disconnect") {
        const edgeId = current.id;
        if (currentHighlightedEdge.value === edgeId) {
          currentHighlightedEdge.value = null;
        }
        graph.removeEdgeData([edgeId]);
        graph.draw();
        edgeCount.value = graph.getEdgeData()?.length || 0;
      }

      if (sourceNodeId.value) {
        sourceNodeId.value = null; // 取消源节点的选中状态
      }
    }
  },
  {
    type: "contextmenu",
    enable: e => e.targetType === "node", // 只对节点触发右键菜单
    getItems: e => {
      const nodeId = e.target.id;
      return [{ name: sourceNodeId.value ? "选择目标节点" : "选择源节点", value: "selectNode", nodeId }];
    },
    onClick: (value, target, current) => {
      if (!graph || !target || !current) return;
      const nodeId = current.id;

      if (value === "selectNode") {
        // 第一次点击
        if (!sourceNodeId.value) {
          sourceNodeId.value = nodeId;
          graph.updateNodeData([
            {
              id: nodeId,
              style: { fill: "#FF5733" } // 高亮源节点
            }
          ]);
          console.log(`Source node selected: ${nodeId}`);
        } else {
          if (sourceNodeId.value === nodeId) {
            ElMessage.warning("源节点和目标节点不能相同！");
            if (sourceNodeId.value) sourceNodeId.value = null;
            return;
          }
          const edgeData = graph.getEdgeData();
          // 检查源节点和目标节点之间是否已有边
          const existingEdge = edgeData.find(edge => (edge.source === sourceNodeId.value && edge.target === nodeId) || (edge.source === nodeId && edge.target === sourceNodeId.value));
          if (existingEdge) {
            ElMessage.warning("源节点和目标节点之间已有边！");
            if (sourceNodeId.value) sourceNodeId.value = null;
            return;
          }
          // 第二次点击，设置目标节点，添加边
          const edgeId = `edge${edgeData.length + 1}-${Date.now()}`;
          const newEdge = {
            id: edgeId,
            source: sourceNodeId.value,
            target: nodeId,
            label: "0.01"
          };

          // 添加新边到图形
          edgeData.push(newEdge);
          graph.addEdgeData([newEdge]);
          edgeCount.value = edgeData.length;
          // 清除源节点高亮，并重置源节点
          graph.updateNodeData([
            {
              id: graph.getNodeData(sourceNodeId.value).id,
              style: { fill: "#ffffff" }
            }
          ]);
          sourceNodeId.value = null;
          console.log(`Edge added: ${sourceNodeId.value} -> ${nodeId}`);
        }
        graph.draw();
      }
    }
  }
]);
const nodeConfig = reactive({
  style: {
    radius: 8,
    labelText: (d: any) => d.data?.label || d.label,
    labelFontSize: 12,
    labelFill: "#000000",
    fill: (d: any) => d.style?.fill || "#ffffff",
    stroke: (d: any) => d.style?.stroke || "#666666",
    lineWidth: (d: any) => d.style?.lineWidth || 2
  }
});

const edgeConfig = reactive({
  style: {
    labelText: (d: any) => d.label,
    labelFontSize: 14,
    labelFill: (d: any) => d.style?.labelFill || "#606266",
    labelBackgroundOpacity: (d: any) => d.style?.labelBackgroundOpacity ?? 0.1,
    stroke: (d: any) => d.style?.stroke || "#cccccc",
    lineWidth: (d: any) => d.style?.lineWidth || 3,
    endArrow: true,
    cursor: "pointer"
  }
});

const layoutConfig = reactive({
  type: "radial",
  unitRadius: unitRadius.value,
  linkDistance: 250
});

const initGraph = () => {
  if (!containerRef.value) return;
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  unitRadius.value = (Math.min(width, height) / 2) * 0.75;
  graph = new Graph({
    container: containerRef.value,
    width: containerRef.value?.clientWidth || 300,
    height: containerRef.value?.clientHeight || 300,
    behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
    autoFit: {
      type: "center"
    },
    data: graphData,
    plugins,
    node: nodeConfig,
    edge: edgeConfig,
    layout: layoutConfig
  });
  graph.render();

  // 添加节点点击事件
  graph.on("node:click", (evt: any) => {
    console.log("点击节点:", evt);
  });

  // 添加边点击事件
  graph.on("edge:click", (evt: any) => {
    const clickedEdge = evt.target;
    if (sourceNodeId.value) {
      sourceNodeId.value = null; // 取消源节点的选中状态
    }
    if (currentHighlightedEdge.value && currentHighlightedEdge.value !== clickedEdge.id) {
      graph.updateEdgeData([
        {
          id: currentHighlightedEdge.value,
          style: {
            stroke: "#cccccc",
            lineWidth: 3,
            labelFontWeight: "normal",
            opacity: 1
          }
        }
      ]);
    }

    graph.updateEdgeData([
      {
        id: clickedEdge.id,
        style: {
          stroke: "#409EFF",
          lineWidth: 3,
          labelFontWeight: "bold",
          opacity: 0.5
        }
      }
    ]);

    currentHighlightedEdge.value = clickedEdge.id;
    graph.draw();
    emit("edgeChange", clickedEdge.id);
  });
};
const handleResize = throttle(() => {
  if (graph && containerRef.value) {
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    graph.resize(width, height);
  }
}, 200);

const handleNodes = nodes => {
  console.log(nodes);
  const finalNodes = nodes.map(node => {
    let GraphNodeData = {
      smiles: node.smiles,
      name: node.id
    };
    return {
      id: node.id,
      type: "vue-node",
      style: {
        component: () => h(GraphNode, { data: Object.assign({}, GraphNodeData) }),
        size: [pxToRemPx(70), pxToRemPx(70)]
      }
    };
  });

  graphData.nodes = finalNodes;
};
const handleEdges = edges => {
  console.log(edges);
  const finalEdges = edges.map((edge, index) => {
    return {
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: `${edge.ecr}`
    };
  });
  graphData.edges = finalEdges;
};

const handleFirstEdgeClick = () => {
  if (!props.isSelectedFirstEdge || graphData.edges.length === 0) return;
  const firstEdgeId = graphData.edges[0].id;
  // 获取边元素
  const edgeElement = graph.getElementData(firstEdgeId);
  if (edgeElement) {
    // 触发边点击事件
    graph.emit("edge:click", {
      target: edgeElement,
      item: edgeElement
    });
  }
};
onMounted(async () => {
  if (props.isDialogEnter) {
    await nextTick();
  }
  const data = {
    smiles: "CC(=O)O"
  };
  const res = await getPerturbationGraphData(data);
  if (res.success) {
    handleNodes(res.data.nodes);
    handleEdges(res.data.links);
    edgeCount.value = res.data.links.length;
    Object.assign(initialGraphData, cloneDeep(graphData));
    if (containerRef.value) {
      initGraph();
      handleFirstEdgeClick();
      window.addEventListener("resize", handleResize);
    }
  } else {
    ElMessage.error(res.message);
  }
});

onUnmounted(() => {
  if (graph) {
    graph.destroy();
    graph = null;
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="pre-container border border-[var(--el-card-border-color)]">
    <div id="perturbationGraph" ref="containerRef" class="g6-container" />
    <div class="count-container">
      <span>共{{ edgeCount }}对配体</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pre-container {
  width: 100%;
  height: 100%;
  position: relative;
  .g6-container {
    width: 100%;
    height: 100%;
    min-width: 300px;
    min-height: 300px;
  }
  .count-container {
    position: absolute;
    bottom: 20px;
    left: 0;
    width: 100%;
    height: 30px;
    background-color: #fff;
    padding: 0 0 0 20px;
  }
}
</style>
