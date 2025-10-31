<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { Graph } from "@antv/g6";
import GraphNode from "./GraphNode/index.vue";
import { h, nextTick } from "vue";
import { throttle } from "@pureadmin/utils";
import { pxToRemPx } from "@/utils/rem";
import { cloneDeep } from "@pureadmin/utils";
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
          if (!graph || !target) return;
          if (value === "disconnect") {
            const edgeId = current.id;
            graph.removeEdgeData([edgeId]);
            graph.draw();
            edgeCount.value = graph.getEdgeData()?.length || 0;
            if (currentHighlightedEdge.value === edgeId) {
              currentHighlightedEdge.value = null;
            }
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
    const radius = (Math.min(width, height) / 2) * 0.75;

    // 调整画布大小
    graph.resize(width, height);

    // 更新布局参数（重要：使用更新后的 radius）
    graph.setLayout({
      type: "radial",
      unitRadius: radius,
      linkDistance: 250
    });

    // 重新渲染
    graph.render();

    // 可选：自适应视图以保持居中
    graph.fitView();
  }
}, 200);

onMounted(async () => {
  if (props.isDialogEnter) {
    await nextTick();
  }
  if (containerRef.value) {
    initGraph();
    // window.addEventListener("resize", handleResize);
  }
});

onUnmounted(() => {
  if (graph) {
    graph.destroy();
    graph = null;
  }
  // window.removeEventListener("resize", handleResize);
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
