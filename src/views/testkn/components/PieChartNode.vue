<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from "vue";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

defineOptions({
  name: "PieChartNode"
});

interface Props {
  data?: {
    name: string;
    isExpanded?: boolean;
    pieData?: Array<{
      label: string;
      value: number;
      color: string;
      id: string;
    }>;
  };
  onSectorClick?: (sectorId: string, sectorData: any) => void;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    name: "",
    isExpanded: false,
    pieData: []
  }),
  onSectorClick: () => {}
});

const chartRef = ref<HTMLElement>();
const containerRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value || !props.data?.pieData || props.data.pieData.length === 0) {
    return;
  }

  // 如果已存在实例，先销毁
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }

  // 显示所有数据（包括值为0的）
  const allData = props.data.pieData || [];
  if (allData.length === 0) return;

  // 初始化 ECharts 实例
  chartInstance = echarts.init(chartRef.value);

  // 准备数据，让所有扇形均匀分布（值相等），原始值只用于标签显示
  const seriesData = allData.map(item => {
    // 确保标签格式：数值和标签换行显示
    let label = item.label;
    // 移除标签中可能已有的数字前缀
    label = label.replace(/^\d+\s*/, "");
    // 换行显示：第一行是数值，第二行是标签
    const displayLabel = `${item.value}\n${label}`;

    return {
      value: 1, // 所有扇形使用相同的值，实现均匀分布
      name: displayLabel,
      itemStyle: {
        color: item.color
      },
      _id: item.id,
      _data: item,
      _originalValue: item.value // 保存原始值
    };
  });

  const option: EChartsOption = {
    graphic: [
      // 中心圆形（浅粉色背景，黄色边框）
      {
        type: "circle",
        left: "center",
        top: "center",
        shape: {
          r: 40 // 调整中心圆半径
        },
        style: {
          fill: "#FFC1CC", // 浅粉色背景
          stroke: "#FFEB3B", // 黄色边框
          lineWidth: 2
        },
        z: 100
      },
      // 中心文字（按空格换行显示）
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: (() => {
            const name = props.data.name || "";
            // 如果包含空格，按空格换行；否则在中间换行
            if (name.includes(" ")) {
              return name.replace(" ", "\n");
            }
            // 如果文字长度超过4个字符，在中间插入换行
            if (name.length > 4) {
              const mid = Math.floor(name.length / 2);
              return name.slice(0, mid) + "\n" + name.slice(mid);
            }
            return name;
          })(),
          fontSize: 11,
          fontWeight: "bold",
          fill: "#000"
        },
        z: 101
      }
    ],
    series: [
      {
        type: "pie",
        radius: ["30%", "85%"], // 内半径和外半径，形成圆环（增大整体比例）
        center: ["50%", "50%"],
        startAngle: 90, // 从顶部开始（12点方向）
        minAngle: 0, // 允许显示很小的扇形（包括值为0的）
        data: seriesData,
        label: {
          show: true,
          position: "inside", // 标签显示在扇形内部
          formatter: (params: any) => {
            // 换行显示：第一行数值，第二行标签
            const lines = params.name.split("\n");
            if (lines.length === 2) {
              return `{value|${lines[0]}}\n{label|${lines[1]}}`;
            }
            return params.name;
          },
          fontSize: 12,
          color: "#fff", // 白色字体
          fontWeight: "normal",
          rich: {
            // 数值行样式（第一行）
            value: {
              fontSize: 13,
              fontWeight: "bold",
              lineHeight: 16,
              color: "#fff",
              align: "center"
            },
            // 标签行样式（第二行）
            label: {
              fontSize: 11,
              lineHeight: 16,
              color: "#fff",
              align: "center"
            }
          }
        },
        labelLine: {
          show: false // 不显示引导线
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2
        },
        // 确保值为0的扇形也能显示（使用最小角度）
        minShowLabelAngle: 0
        // 使用 ECharts 默认的悬浮效果，不自定义 emphasis
      }
    ]
  };

  chartInstance.setOption(option);

  // 监听点击事件
  chartInstance.on("click", (params: any) => {
    if (params.data?._id && props.onSectorClick) {
      props.onSectorClick(params.data._id, params.data._data);
    }
  });
};

onMounted(() => {
  if (props.data?.isExpanded) {
    nextTick(() => {
      initChart();
    });
  }
});

watch(
  () => [props.data?.isExpanded, props.data?.pieData],
  () => {
    if (props.data?.isExpanded) {
      nextTick(() => {
        initChart();
      });
    } else {
      // 如果收起，销毁图表实例
      if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
      }
    }
  },
  { deep: true }
);

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<template>
  <div ref="containerRef" class="pie-node-container">
    <!-- 普通节点模式 -->
    <div v-if="!data.isExpanded" class="normal-node">
      <div class="node-icon">
        <div class="icon-circle">
          <div class="icon-inner">
            <div class="pill-icon" />
          </div>
        </div>
      </div>
      <div class="node-name">{{ data.name }}</div>
    </div>

    <!-- 饼图模式 -->
    <div v-else class="pie-node">
      <div ref="chartRef" class="pie-chart" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pie-node-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.normal-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);

  &::after {
    content: "";
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #ff8c8c;
  }
}

.icon-inner {
  width: 40px;
  height: 40px;
  background-color: #c92a2a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.pill-icon {
  width: 20px;
  height: 8px;
  background-color: #fff;
  border-radius: 4px;
  transform: rotate(45deg);
}

.node-name {
  font-size: 12px;
  font-weight: bold;
  color: #333;
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pie-node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 300px;
}

.pie-chart {
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
