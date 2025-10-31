<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { Graph } from "@antv/g6";
import GraphNode from "./GraphNode/index.vue";
import { h, nextTick } from "vue";
import { throttle } from "@pureadmin/utils";
import { pxToRemPx } from "@/utils/rem";
import { cloneDeep } from "@pureadmin/utils";
import { ElMessage } from "element-plus";
defineOptions({
  name: "PerturbationGraph"
});
let graph: Graph | null = null;

const containerRef = ref<HTMLElement>();

const currentHighlightedEdge = ref<string | null>(null);

interface Iprops {
  isDialogEnter?: boolean;
  width?: string;
  height?: string;
}

const sourceNodeId = ref<string | null>(null);
const props = withDefaults(defineProps<Iprops>(), {
  isDialogEnter: false,
  width: "500px",
  height: "500px"
});

const initialData = {
  nodes: [
    {
      id: "c",
      type: "vue-node",
      style: {
        component: () => h(GraphNode)
      }
    },
    {
      id: "c1",
      type: "vue-node",
      style: {
        component: () => h(GraphNode)
      }
    },
    {
      id: "c2",
      type: "vue-node",
      style: {
        component: () => h(GraphNode)
      }
    },
    {
      id: "c3",
      type: "vue-node",
      style: {
        component: () => h(GraphNode)
      }
    },
    {
      id: "c4",
      type: "vue-node",
      style: {
        component: () => h(GraphNode)
      }
    },
    {
      id: "c5",
      type: "vue-node",
      style: {
        component: () => h(GraphNode)
      }
    }
  ],
  edges: [
    {
      id: "edge1",
      source: "c",
      target: "c1",
      label: "0.008"
    },
    {
      id: "edge2",
      source: "c",
      target: "c2",
      label: "0.01"
    },
    {
      id: "edge3",
      source: "c",
      target: "c3",
      label: "0.01"
    },
    {
      id: "edge4",
      source: "c",
      target: "c4",
      label: "0.01"
    },
    {
      id: "edge5",
      source: "c",
      target: "c5",
      label: "0.008"
    }
  ]
};

// 深拷贝初始数据用于重置（保留函数属性）
const getInitialData = () => {
  return cloneDeep(initialData);
};

// 当前数据
const data = getInitialData();

// 用于响应式更新边数
const edgeCount = ref(data.edges.length);

const initGraph = () => {
  if (!containerRef.value) return;
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  const radius = (Math.min(width, height) / 2) * 0.75;
  console.log(width, height, radius);
  graph = new Graph({
    container: containerRef.value,
    width: containerRef.value.clientWidth,
    height: containerRef.value.clientHeight,
    behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
    autoFit: {
      type: "center"
    },
    data,
    plugins: [
      {
        type: "toolbar",
        getItems: () => [
          { id: "zoom-in", value: "zoom-in" },
          { id: "zoom-out", value: "zoom-out" },
          { id: "auto-fit", value: "auto-fit" },
          { id: "reset", value: "reset" }
        ],
        onClick: value => {
          if (value === "zoom-in") {
            graph.zoomTo(1.1);
          } else if (value === "zoom-out") {
            graph.zoomTo(0.9);
          } else if (value === "auto-fit") {
            graph.fitView();
          } else if (value === "reset") {
            currentHighlightedEdge.value = null;
            // 重置数据到初始状态
            const resetData = getInitialData();
            graph.setData(resetData);
            graph.render();
            edgeCount.value = resetData.edges.length;
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
    ],
    node: {
      style: {
        size: [pxToRemPx(70), pxToRemPx(70)],
        radius: 8,
        labelText: (d: any) => d.data?.label || d.label,
        labelFontSize: 12,
        labelFill: "#000000",
        fill: (d: any) => d.style?.fill || "#ffffff",
        stroke: (d: any) => d.style?.stroke || "#666666",
        lineWidth: (d: any) => d.style?.lineWidth || 2
      }
    },
    edge: {
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
    },
    layout: {
      type: "radial",
      unitRadius: radius,
      linkDistance: 250
    }
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
  });
};
const handleResize = throttle(() => {
  if (graph && containerRef.value) {
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    graph.resize(width, height);
    // graph.fitView();
  }
}, 200);

onMounted(async () => {
  if (props.isDialogEnter) {
    await nextTick();
  }
  if (containerRef.value) {
    initGraph();
    window.addEventListener("resize", handleResize);
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
  <div class="pre-container">
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
