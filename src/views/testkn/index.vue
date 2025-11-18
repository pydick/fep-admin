<template>
  <div class="flow-container">
    <div ref="graphContainer" class="graph-container" />
    <!-- 适应症选择对话框 -->
    <Adapt ref="adaptRef" v-model:visible="adaptVisible" :drug-name="currentDrugName" :indications="indicationsList" @confirm="handleAdaptConfirm" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted, reactive, h, nextTick } from "vue";
import { Graph } from "@antv/g6";
import { throttle } from "@pureadmin/utils";
import PieChartNode from "./components/PieChartNode.vue";
import Adapt from "./components/Adapt.vue";

defineOptions({
  name: "TestKnFlow"
});

let graph: Graph | null = null;
const graphContainer = ref<HTMLElement>();

const currentSectorData = ref<any>(null);
const sourceNodeId = ref<string | null>(null);

// Adapt 组件相关
const adaptRef = ref();
const adaptVisible = ref(false);
const currentDrugName = ref("氘可来昔替尼");
const indicationsList = ref<Array<{ id: string; name: string }>>([]);

// 图数据
const graphData = reactive({
  nodes: [
    {
      id: "node1",
      type: "vue-node",
      label: "氘可来昔替尼",
      data: {
        name: "氘可来昔替尼",
        isExpanded: false,
        pieData: [
          { id: "sector1", label: "在研适应症", value: 16, color: "#4CAF50" },
          { id: "sector2", label: "非在研适应症", value: 1, color: "#2E7D32" },
          { id: "sector3", label: "在研公司", value: 3, color: "#2196F3" },
          { id: "sector4", label: "非在研公司", value: 0, color: "#90CAF9" },
          { id: "sector5", label: "靶点", value: 1, color: "#FF9800" }
        ]
      },
      style: {
        size: [100, 100],
        component: (d: any) => {
          // G6 可能传递不同的数据格式，需要兼容处理
          let nodeData = null;
          let nodeId = "node1";

          if (d) {
            // 如果 d 有 data 属性，使用它
            if (d.data) {
              nodeData = d.data;
              nodeId = d.id || "node1";
            }
            // 如果 d 本身就是数据对象
            else if (d.name || d.pieData) {
              nodeData = d;
              nodeId = d.id || "node1";
            }
          }

          // 如果还是没有数据，尝试从 graphData 中获取
          if (!nodeData) {
            const node = graphData.nodes.find(n => n.id === (d?.id || "node1"));
            nodeData = node?.data || graphData.nodes[0]?.data;
            nodeId = node?.id || "node1";
          }

          if (!nodeData) {
            console.error("节点数据未定义", { d, graphData: graphData.nodes });
            // 返回一个默认的占位组件
            return h("div", { style: "width: 100px; height: 100px; background: #ccc;" }, "数据加载中");
          }

          return h(PieChartNode, {
            data: nodeData,
            onSectorClick: (sectorId: string, sectorData: any) => {
              handleSectorClick(nodeId, sectorId, sectorData);
            }
          } as any);
        }
      }
    }
  ],
  edges: []
});

// 获取适应症数据
const getIndicationsData = () => {
  return [
    { id: "ind1", name: "自身免疫性疾病" },
    { id: "ind2", name: "银屑病" },
    { id: "ind3", name: "系统性红斑狼疮" },
    { id: "ind4", name: "克罗恩病" },
    { id: "ind5", name: "溃疡性结肠炎" },
    { id: "ind6", name: "肝病" },
    { id: "ind7", name: "肾脏疾病" },
    { id: "ind8", name: "斑块状银屑病" },
    { id: "ind9", name: "银屑病关节炎" },
    { id: "ind10", name: "狼疮性肾炎" },
    { id: "ind11", name: "类风湿性关节炎" },
    { id: "ind12", name: "强直性脊柱炎" },
    { id: "ind13", name: "干燥综合征" },
    { id: "ind14", name: "硬皮病" },
    { id: "ind15", name: "多发性肌炎" },
    { id: "ind16", name: "皮肌炎" }
  ];
};

// 处理扇形点击
const handleSectorClick = (nodeId: string, sectorId: string, sectorData: any) => {
  console.log("扇形点击:", { nodeId, sectorId, sectorData });
  sourceNodeId.value = nodeId;
  currentSectorData.value = sectorData;

  // 如果是"在研适应症"（sector1），使用 Adapt 组件
  if (sectorId === "sector1") {
    console.log("打开在研适应症弹窗");
    // 获取当前节点数据，用于显示药物名称
    const nodeData = graphData.nodes.find(n => n.id === nodeId);
    if (nodeData) {
      currentDrugName.value = nodeData.data?.name || "氘可来昔替尼";
    }

    // 设置适应症数据
    indicationsList.value = getIndicationsData();

    // 打开 Adapt 弹窗
    adaptVisible.value = true;
    console.log("弹窗状态:", adaptVisible.value);
  } else {
    console.log("其他扇形，暂不处理:", sectorId);
  }
};

// 处理 Adapt 组件的确认事件
const handleAdaptConfirm = (selectedIds: string[]) => {
  // 根据选中的适应症 ID 创建新节点
  if (selectedIds.length > 0) {
    selectedIds.forEach(itemId => {
      const indication = indicationsList.value.find(ind => ind.id === itemId);
      if (!indication || !sourceNodeId.value) return;

      const newNodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const nodeData = {
        name: indication.name,
        isExpanded: false,
        pieData: [
          { id: "sector1", label: "在研适应症", value: 5, color: "#4CAF50" },
          { id: "sector2", label: "非在研适应症", value: 2, color: "#2E7D32" },
          { id: "sector3", label: "在研公司", value: 1, color: "#2196F3" },
          { id: "sector4", label: "靶点", value: 1, color: "#FF9800" }
        ]
      };
      const newNode = {
        id: newNodeId,
        type: "vue-node",
        label: indication.name,
        data: nodeData,
        style: {
          size: [100, 100],
          component: (d: any) => {
            let finalData = nodeData;

            if (d) {
              if (d.data) {
                finalData = d.data;
              } else if (d.name || d.pieData) {
                finalData = d;
              }
            }

            if (!finalData) {
              console.error("新节点数据为空", { d, nodeData, newNodeId });
              return h("div", { style: "width: 100px; height: 100px; background: #ccc;" }, "数据加载中");
            }

            return h(PieChartNode, {
              data: finalData,
              onSectorClick: (sectorId: string, sectorData: any) => {
                handleSectorClick(newNodeId, sectorId, sectorData);
              }
            } as any);
          }
        }
      };

      // 添加新节点
      graphData.nodes.push(newNode);

      // 添加边
      const newEdge = {
        id: `edge_${sourceNodeId.value}_${newNodeId}`,
        source: sourceNodeId.value,
        target: newNodeId,
        label: currentSectorData.value?.label || ""
      };
      graphData.edges.push(newEdge);
    });

    // 更新图
    if (graph) {
      graph.setData(graphData as any);
      graph.render();
    }
  }

  // 将源节点的 isExpanded 置为 false，收起饼图
  if (sourceNodeId.value) {
    const sourceNodeIndex = graphData.nodes.findIndex(n => n.id === sourceNodeId.value);
    if (sourceNodeIndex !== -1) {
      const sourceNode = graphData.nodes[sourceNodeIndex];
      if (sourceNode.data) {
        (sourceNode.data as any).isExpanded = false;

        // 更新节点样式
        (sourceNode as any).style = {
          ...(sourceNode as any).style,
          size: [100, 100],
          component: (d: any) => {
            let nodeDataForComponent = sourceNode.data;

            if (d) {
              if (d.data) {
                nodeDataForComponent = d.data;
              } else if (d.name || d.pieData) {
                nodeDataForComponent = d;
              }
            }

            if (!nodeDataForComponent) {
              console.error("更新源节点时数据为空", { d, sourceNode });
              return h("div", { style: "width: 100px; height: 100px; background: #ccc;" }, "数据加载中");
            }

            return h(PieChartNode, {
              data: nodeDataForComponent,
              onSectorClick: (sectorId: string, sectorData: any) => {
                handleSectorClick(sourceNodeId.value!, sectorId, sectorData);
              }
            } as any);
          }
        };

        // 更新图中的节点
        graph.updateNodeData([
          {
            id: sourceNodeId.value,
            data: sourceNode.data,
            style: (sourceNode as any).style
          }
        ]);

        // 重新布局和渲染
        graph.layout();
        graph.render();
      }
    }
  }

  sourceNodeId.value = null;
};

// 初始化图
const initGraph = () => {
  if (!graphContainer.value) return;

  const width = graphContainer.value.clientWidth || 800;
  const height = graphContainer.value.clientHeight || 600;

  graph = new Graph({
    container: graphContainer.value,
    width,
    height,
    behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
    autoFit: {
      type: "center"
    },
    node: {
      style: {
        size: (d: any) => {
          if (d.data?.isExpanded) return [300, 300];
          return [100, 100];
        },
        labelText: () => "" // 不显示默认标签，使用自定义组件
      }
    },
    edge: {
      style: {
        labelText: (d: any) => d.label || "",
        labelFontSize: 10,
        labelFill: "#606266",
        labelBackgroundFill: "#ffffff",
        labelBackgroundOpacity: 0.8,
        stroke: "#cccccc",
        lineWidth: 2,
        endArrow: true
      }
    },
    layout: {
      type: "force",
      preventOverlap: true,
      nodeSize: 100,
      linkDistance: 150
    }
  });

  graph.setData(graphData as any);
  graph.render();

  console.log("图初始化完成", { nodes: graphData.nodes, edges: graphData.edges });

  // 节点点击事件 - 展开/收起饼图
  graph.on("node:click", (evt: any) => {
    console.log("节点点击事件:", evt);
    // 检查是否点击在 canvas 上（饼图模式），如果是则不处理
    const target = evt.target;
    const originalTarget = evt.originalEvent?.target;

    // 检查点击目标是否是 canvas 或 canvas 的子元素
    const isCanvasClick = (target && (target.tagName === "CANVAS" || target.closest?.("canvas"))) || (originalTarget && (originalTarget.tagName === "CANVAS" || originalTarget.closest?.("canvas")));

    if (isCanvasClick) {
      console.log("点击在 canvas 上，忽略节点点击事件");
      return;
    }

    // 从事件中获取节点ID
    const nodeId = evt.item?.id || evt.target?.id;
    if (!nodeId) return;

    const nodeData = graph.getNodeData(nodeId);

    if (nodeData && nodeData.data) {
      // 如果节点已展开，点击应该触发扇形点击，而不是切换状态
      if (nodeData.data.isExpanded) {
        console.log("节点已展开，应该点击扇形区域");
        return;
      }

      // 切换展开状态
      const updatedData = { ...nodeData.data };
      updatedData.isExpanded = !updatedData.isExpanded;

      console.log("更新节点:", { nodeId, isExpanded: updatedData.isExpanded });

      // 更新节点数据
      const nodeIndex = graphData.nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex !== -1) {
        (graphData.nodes[nodeIndex] as any).data = updatedData;
        (graphData.nodes[nodeIndex] as any).style = {
          ...(graphData.nodes[nodeIndex] as any).style,
          size: updatedData.isExpanded ? [300, 300] : [100, 100],
          component: (d: any) => {
            // 优先使用 updatedData，因为这是最新的数据
            let nodeDataForComponent = updatedData;

            if (d) {
              if (d.data) {
                nodeDataForComponent = d.data;
              } else if (d.name || d.pieData) {
                nodeDataForComponent = d;
              }
            }

            if (!nodeDataForComponent) {
              console.error("更新节点时数据为空", { d, updatedData, nodeId });
              return h("div", { style: "width: 100px; height: 100px; background: #ccc;" }, "数据加载中");
            }

            return h(PieChartNode, {
              data: nodeDataForComponent,
              onSectorClick: (sectorId: string, sectorData: any) => {
                handleSectorClick(nodeId, sectorId, sectorData);
              }
            } as any);
          }
        };
      }

      // 更新图
      graph.updateNodeData([
        {
          id: nodeId,
          data: updatedData,
          style: {
            size: updatedData.isExpanded ? [300, 300] : [100, 100],
            component: (d: any) => {
              // 优先使用 updatedData，因为这是最新的数据
              let nodeDataForComponent = updatedData;

              if (d) {
                if (d.data) {
                  nodeDataForComponent = d.data;
                } else if (d.name || d.pieData) {
                  nodeDataForComponent = d;
                }
              }

              if (!nodeDataForComponent) {
                console.error("更新节点时数据为空", { d, updatedData, nodeId });
                return h("div", { style: "width: 100px; height: 100px; background: #ccc;" }, "数据加载中");
              }

              return h(PieChartNode, {
                data: nodeDataForComponent,
                onSectorClick: (sectorId: string, sectorData: any) => {
                  handleSectorClick(nodeId, sectorId, sectorData);
                }
              } as any);
            }
          }
        }
      ]);

      // 重新布局和渲染
      graph.layout();
      graph.render();
    }
  });
};

const handleResize = throttle(() => {
  if (graph && graphContainer.value) {
    const width = graphContainer.value.clientWidth || 800;
    const height = graphContainer.value.clientHeight || 600;
    graph.resize(width, height);
  }
}, 200);

onMounted(() => {
  nextTick(() => {
    initGraph();
    window.addEventListener("resize", handleResize);
  });
});

onUnmounted(() => {
  if (graph) {
    graph.destroy();
    graph = null;
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<style lang="scss" scoped>
.flow-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f5f5f5;
}

.graph-container {
  width: 100%;
  height: 100%;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
