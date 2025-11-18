<template>
  <div class="flow-container">
    <div ref="graphContainer" class="graph-container" />
    <!-- 选择对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
      <div class="dialog-content">
        <el-checkbox-group v-model="selectedItems">
          <el-checkbox v-for="item in dialogOptions" :key="item.id" :label="item.id" class="option-item">
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSelection">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted, reactive, h, nextTick } from "vue";
import { Graph } from "@antv/g6";
import { throttle } from "@pureadmin/utils";
import PieChartNode from "./components/PieChartNode.vue";

defineOptions({
  name: "TestKnFlow"
});

let graph: Graph | null = null;
const graphContainer = ref<HTMLElement>();

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref("选择内容");
const dialogOptions = ref<Array<{ id: string; name: string }>>([]);
const selectedItems = ref<string[]>([]);
const currentSectorData = ref<any>(null);
const sourceNodeId = ref<string | null>(null);

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

// 根据扇形ID生成选项数据
const getOptionsBySectorId = (sectorId: string) => {
  const optionsMap: Record<string, Array<{ id: string; name: string }>> = {
    sector1: [
      { id: "ind1", name: "自身免疫性疾病" },
      { id: "ind2", name: "银屑病" },
      { id: "ind3", name: "系统性红斑狼疮" },
      { id: "ind4", name: "克罗恩病" },
      { id: "ind5", name: "溃疡性结肠炎" }
    ],
    sector2: [
      { id: "ind6", name: "肝病" },
      { id: "ind7", name: "肾脏疾病" }
    ],
    sector3: [
      { id: "comp1", name: "公司A" },
      { id: "comp2", name: "公司B" },
      { id: "comp3", name: "公司C" }
    ],
    sector4: [
      { id: "target1", name: "TYK2" },
      { id: "target2", name: "JAK1" }
    ]
  };
  return optionsMap[sectorId] || [];
};

// 处理扇形点击
const handleSectorClick = (nodeId: string, sectorId: string, sectorData: any) => {
  sourceNodeId.value = nodeId;
  currentSectorData.value = sectorData;
  dialogOptions.value = getOptionsBySectorId(sectorId);
  dialogTitle.value = `选择${sectorData.label}`;
  selectedItems.value = [];
  dialogVisible.value = true;
};

// 确认选择
const confirmSelection = () => {
  if (selectedItems.value.length === 0) {
    return;
  }

  // 为每个选中的项创建新节点
  selectedItems.value.forEach(itemId => {
    const option = dialogOptions.value.find(opt => opt.id === itemId);
    if (!option || !sourceNodeId.value) return;

    const newNodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const nodeData = {
      name: option.name,
      isExpanded: false,
      pieData: [
        { id: "sector1", label: "5 在研适应症", value: 5, color: "#4CAF50" },
        { id: "sector2", label: "2 非在研适应症", value: 2, color: "#2E7D32" },
        { id: "sector3", label: "1 在研公司", value: 1, color: "#2196F3" },
        { id: "sector4", label: "1 靶点", value: 1, color: "#FF9800" }
      ]
    };
    const newNode = {
      id: newNodeId,
      type: "vue-node",
      label: option.name,
      data: nodeData,
      style: {
        size: [100, 100],
        component: (d: any) => {
          // 优先使用 nodeData，因为这是创建时传入的数据
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

  dialogVisible.value = false;
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
    // 检查是否点击在 canvas 上（饼图模式），如果是则不处理
    const target = evt.target;
    if (target && (target.tagName === "CANVAS" || target.closest("canvas"))) {
      return;
    }

    // 从事件中获取节点ID
    const nodeId = evt.item?.id || evt.target?.id;
    if (!nodeId) return;

    const nodeData = graph.getNodeData(nodeId);

    if (nodeData && nodeData.data) {
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
  height: 100vh;
  position: relative;
  background-color: #f5f5f5;
}

.graph-container {
  width: 100%;
  height: 100%;
}

.dialog-content {
  max-height: 400px;
  overflow-y: auto;
}

.option-item {
  display: block;
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
