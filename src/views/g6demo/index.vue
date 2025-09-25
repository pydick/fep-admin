<template>
  <div class="g6-demo-container">
    <div id="g6-container" ref="containerRef" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from "vue";
import { Graph } from "@antv/g6";

const containerRef = ref<HTMLElement>();
let graph: Graph | null = null;

// 图数据 - 根据原图精确布局
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
        lineWidth: 2
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
        stroke: "lightgreen",
        lineWidth: (d: any) => d.style?.lineWidth || 2,
        endArrow: true,
        endArrowSize: 8
      }
    },
    layout: {
      type: "force",
      center: [500, 300],
      linkDistance: 150,
      nodeStrength: -500, // 增强斥力
      edgeStrength: 0.1, // 减弱边的拉力
      preventOverlap: true,
      nodeSize: 30,
      alpha: 0.3, // 降低初始能量
      alphaDecay: 0.028,
      iterations: 200
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

<style lang="scss" scoped>
.g6-demo-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
}

#g6-container {
  width: 600px;
  height: 600px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
