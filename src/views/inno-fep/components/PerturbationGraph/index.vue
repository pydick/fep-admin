<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { Graph } from "@antv/g6";
defineOptions({
  name: "PerturbationGraph"
});

const containerRef = ref<HTMLElement>();
let graph: Graph | null = null;

// 分子结构SVG图标
const moleculeIcon = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <g>
    <circle cx="8" cy="12" r="3" fill="#666"/>
    <circle cx="20" cy="8" r="3" fill="#666"/>
    <circle cx="32" cy="12" r="3" fill="#666"/>
    <circle cx="12" cy="28" r="3" fill="#666"/>
    <circle cx="28" cy="28" r="3" fill="#666"/>
    <line x1="8" y1="12" x2="20" y2="8" stroke="#666" stroke-width="1.5"/>
    <line x1="20" y1="8" x2="32" y2="12" stroke="#666" stroke-width="1.5"/>
    <line x1="8" y1="12" x2="12" y2="28" stroke="#666" stroke-width="1.5"/>
    <line x1="32" y1="12" x2="28" y2="28" stroke="#666" stroke-width="1.5"/>
    <line x1="12" y1="28" x2="28" y2="28" stroke="#666" stroke-width="1.5"/>
  </g>
</svg>`;

// 图数据 - 以c5为中心的辐向布局
const data = {
  nodes: [
    {
      id: "c5",
      data: {
        label: "c5"
      },
      style: {
        fill: "#ffffff",
        stroke: "#666666",
        lineWidth: 2
      }
    },
    {
      id: "1029-5",
      data: {
        label: "1029-5"
      },
      style: {
        fill: "#ffffff",
        stroke: "#666666",
        lineWidth: 2
      }
    },
    {
      id: "1029-13",
      data: {
        label: "1029-13"
      },
      style: {
        fill: "#ffffff",
        stroke: "#666666",
        lineWidth: 2
      }
    },
    {
      id: "1029-23",
      data: {
        label: "1029-23"
      },
      style: {
        fill: "#ffffff",
        stroke: "#666666",
        lineWidth: 2
      }
    },
    {
      id: "1029-24",
      data: {
        label: "1029-24"
      },
      style: {
        fill: "#ffff99",
        stroke: "#666666",
        lineWidth: 2
      }
    },
    {
      id: "1029-4",
      data: {
        label: "1029-4"
      },
      style: {
        fill: "#ffffff",
        stroke: "#666666",
        lineWidth: 2,
        size: 50,
        iconSrc: `data:image/svg+xml;base64,${btoa(moleculeIcon)}`,
        iconWidth: 30,
        iconHeight: 30
      }
    }
  ],
  edges: [
    {
      id: "edge1",
      source: "c5",
      target: "1029-5",
      label: "0.008",
      style: {
        stroke: "#000000",
        lineWidth: 3
      }
    },
    {
      id: "edge2",
      source: "c5",
      target: "1029-13",
      label: "0.01",
      style: {
        stroke: "#00cccc",
        lineWidth: 3
      }
    },
    {
      id: "edge3",
      source: "c5",
      target: "1029-23",
      label: "0.01",
      style: {
        stroke: "#cccccc",
        lineWidth: 2
      }
    },
    {
      id: "edge4",
      source: "c5",
      target: "1029-24",
      label: "0.01",
      style: {
        stroke: "#cccccc",
        lineWidth: 2
      }
    },
    {
      id: "edge5",
      source: "c5",
      target: "1029-4",
      label: "0.008",
      style: {
        stroke: "#000000",
        lineWidth: 3
      }
    }
  ]
};

const initGraph = () => {
  if (!containerRef.value) return;

  graph = new Graph({
    container: containerRef.value,
    // autoFit: {
    //   type: "center"
    // },
    plugins: [
      {
        type: "grid-line",
        follow: false
      }
    ],
    behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
    node: {
      style: {
        size: 30,
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
        endArrow: false
      }
    },
    layout: {
      type: "radial",
      center: [300, 300],
      radius: 150,
      focusNode: "c5", // 以c5为中心
      unitRadius: 100,
      nodeSpacing: 10,
      preventOverlap: true,
      strictRadial: false
    }
  });

  // 渲染数据
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

onMounted(() => {
  initGraph();
});

onUnmounted(() => {
  if (graph) {
    graph.destroy();
    graph = null;
  }
});
</script>

<template>
  <div id="g6-container" ref="containerRef" />
</template>

<style lang="scss" scoped>
#g6-container {
  min-width: 600px;
  min-height: 600px;
}
</style>
