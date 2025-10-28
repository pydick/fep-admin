<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { Graph } from "@antv/g6";
import GraphNode from "./GraphNode/index.vue";
import { h } from "vue";
defineOptions({
  name: "PerturbationGraph"
});

const containerRef = ref<HTMLElement>();
let graph: Graph | null = null;

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

  graph = new Graph({
    container: containerRef.value,
    behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
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
      // type: "rect",
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
      center: [370, 300],
      unitRadius: 250,
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

onMounted(() => {
  initGraph();
});

onUnmounted(() => {});
</script>

<template>
  <div id="g6-container" ref="containerRef" />
</template>

<style lang="scss" scoped>
#g6-container {
  min-width: 600px;
  min-height: 600px;
  width: 740px;
  height: 650px;
}
</style>
