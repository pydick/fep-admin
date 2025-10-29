<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { Graph } from "@antv/g6";
import GraphNode from "./GraphNode/index.vue";
import { h, nextTick } from "vue";
defineOptions({
  name: "PerturbationGraph"
});
let graph: Graph | null = null;

const containerRef = ref<HTMLElement>();

interface IP {
  isDialogEnter?: boolean;
  width?: string;
  height?: string;
}
const props = withDefaults(defineProps<IP>(), {
  isDialogEnter: false,
  width: "500px",
  height: "500px"
});

const nodes = [
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
];

const data = {
  nodes: nodes,
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

const initGraph = () => {
  if (!containerRef.value) return;
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  const radius = Math.min(width, height) / 2 - 100;
  console.log(width, height, radius);
  graph = new Graph({
    container: containerRef.value,
    width: containerRef.value.clientWidth,
    height: containerRef.value.clientHeight,
    behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
    autoFit: {
      type: "center"
    },
    plugins: [
      {
        type: "toolbar",
        getItems: () => [
          { id: "zoom-in", value: "zoom-in" },
          { id: "zoom-out", value: "zoom-out" },
          { id: "auto-fit", value: "auto-fit" }
        ],
        onClick: value => {
          if (value === "zoom-in") {
            graph.zoomTo(1.1);
          } else if (value === "zoom-out") {
            graph.zoomTo(0.9);
          } else if (value === "auto-fit") {
            graph.fitView();
          }
        }
      }
    ],
    node: {
      style: {
        size: [70, 70],
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
        labelFontSize: 10,
        labelFill: "#000000",
        labelBackgroundFill: "#ffffff",
        labelBackgroundOpacity: 0.8,
        labelPadding: [2, 4],
        stroke: (d: any) => d.style?.stroke || "#cccccc",
        lineWidth: (d: any) => d.style?.lineWidth || 2,
        endArrow: true
      }
    },
    layout: {
      type: "radial",
      unitRadius: radius,
      linkDistance: 250
    }
  });

  graph.setData(data);
  graph.render();

  // 添加节点点击事件
  graph.on("node:click", (evt: any) => {
    console.log("点击节点:", evt);
  });

  // 添加边点击事件
  graph.on("edge:click", (evt: any) => {
    console.log("点击边:", evt);
  });
};
const handleResize = () => {
  if (graph && containerRef.value) {
    graph.resize(containerRef.value.clientWidth, containerRef.value.clientHeight);
    graph.fitView();
  }
};

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
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div id="g6-container" ref="containerRef" />
</template>

<style lang="scss" scoped>
.g6-container {
  width: 100%;
  height: 100%;
  min-width: 300px;
  min-height: 300px;
}
</style>
