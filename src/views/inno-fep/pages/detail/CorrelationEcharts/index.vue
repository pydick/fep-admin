<script setup lang="ts">
import * as echarts from "echarts";
import { ref, onMounted, onUnmounted, nextTick } from "vue";

defineOptions({
  name: "CorrelationEcharts"
});

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// 根据图片描述的数据点（6个 Retrospective 数据点）
// 数据格式: [x, y, xError?, yError?]
const retrospectiveData = [
  [-14.5, -15.5, 0.3, 0], // 有水平误差条
  [-13.8, -15.8, 0.3, 0], // 有水平误差条
  [-12.0, -12.8, 0, 0.3], // 有垂直误差条
  [-11.0, -11.0, 0, 0.2], // 有垂直误差条
  [-10.5, -9.5, 0, 0.3], // 有垂直误差条
  [-10.0, -9.0, 0, 0.3] // 有垂直误差条
];

// 根据原图设置固定的坐标轴范围
const xMin = -15.0;
const xMax = -9.5;
const yMin = -16.3;
const yMax = -8.2;

// 置信带的宽度（相对于对角线的偏移）
const confidenceBandWidthOuter = 1.5; // 外层较宽的置信带
const confidenceBandWidthInner = 0.8; // 内层较窄的置信带

// 构建置信带数据（围绕 y=x 线的带状区域）
const buildConfidenceBand = (width: number) => {
  // 计算置信带需要覆盖的范围（考虑坐标轴范围）
  const min = Math.min(xMin, yMin);
  const max = Math.max(xMax, yMax);
  const step = 0.05; // 更小的步长以获得更平滑的曲线
  const upper: number[][] = [];
  const lower: number[][] = [];

  for (let x = min; x <= max; x += step) {
    const y = x; // y = x 线
    upper.push([x, y + width]);
    lower.push([x, y - width]);
  }

  // 合并成区域数据（用于 areaStyle）：先上边界，再下边界（反向）
  return upper.concat(lower.reverse());
};

const confidenceBandDataOuter = buildConfidenceBand(confidenceBandWidthOuter);
const confidenceBandDataInner = buildConfidenceBand(confidenceBandWidthInner);

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  // 构建误差条数据
  const buildErrorBars = () => {
    const errorBars: any[] = [];

    retrospectiveData.forEach((point, index) => {
      const [x, y, xError, yError] = point;

      // 水平误差条
      if (xError && xError > 0) {
        errorBars.push({
          name: `error-x-${index}`,
          type: "line",
          data: [
            [x - xError, y],
            [x + xError, y]
          ],
          lineStyle: {
            color: "#1f77b4",
            width: 0.1
          },
          showSymbol: false,
          z: 2,
          silent: true,
          animation: false
        });
        // 添加误差条端点（两杠）- 水平误差条的端点应该是垂直的
        errorBars.push({
          name: `error-x-cap-${index}-1`,
          type: "line",
          data: [
            [x - xError, y - 0.01],
            [x - xError, y + 0.01]
          ],
          lineStyle: {
            color: "#1f77b4",
            width: 0.1,
            type: "solid"
          },
          showSymbol: false,
          z: 4,
          silent: true,
          animation: false
        });
        errorBars.push({
          name: `error-x-cap-${index}-2`,
          type: "line",
          data: [
            [x + xError, y - 0.01],
            [x + xError, y + 0.01]
          ],
          lineStyle: {
            color: "#1f77b4",
            width: 0.1,
            type: "solid"
          },
          showSymbol: false,
          z: 4,
          silent: true,
          animation: false
        });
      }

      // 垂直误差条
      if (yError && yError > 0) {
        errorBars.push({
          name: `error-y-${index}`,
          type: "line",
          data: [
            [x, y - yError],
            [x, y + yError]
          ],
          lineStyle: {
            color: "#1f77b4",
            width: 0.1
          },
          showSymbol: false,
          z: 2,
          silent: true,
          animation: false
        });
        // 添加误差条端点（两杠）- 垂直误差条的端点应该是水平的
        errorBars.push({
          name: `error-y-cap-${index}-1`,
          type: "line",
          data: [
            [x - 0.01, y - yError],
            [x + 0.01, y - yError]
          ],
          lineStyle: {
            color: "#1f77b4",
            width: 0.1,
            type: "solid"
          },
          showSymbol: false,
          z: 4,
          silent: true,
          animation: false
        });
        errorBars.push({
          name: `error-y-cap-${index}-2`,
          type: "line",
          data: [
            [x - 0.01, y + yError],
            [x + 0.01, y + yError]
          ],
          lineStyle: {
            color: "#1f77b4",
            width: 0.1,
            type: "solid"
          },
          showSymbol: false,
          z: 4,
          silent: true,
          animation: false
        });
      }
    });

    return errorBars;
  };

  const errorBarSeries = buildErrorBars();

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        if (params.seriesName === "Retrospective") {
          return `Retrospective<br/>X: ${params.value[0].toFixed(2)}<br/>Y: ${params.value[1].toFixed(2)}`;
        }
        return "";
      }
    },
    legend: {
      data: ["Retrospective", "Prospective"],
      top: 10,
      left: "center",
      itemGap: 20
    },
    grid: {
      left: "12%",
      right: "10%",
      bottom: "12%",
      top: "15%",
      containLabel: false
    },
    xAxis: {
      type: "value",
      min: xMin,
      max: xMax,
      minInterval: 0.5,
      splitNumber: 12,
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: (value: number) => {
          // 只显示主要刻度：-15.00, -14.00, -13.00, -12.00, -11.00, -10.00, -9.50
          if (value === -15.0 || value === -14.0 || value === -13.0 || value === -12.0 || value === -11.0 || value === -10.0 || value === -9.5) {
            return value.toFixed(2);
          }
          return "";
        }
      },
      nameLocation: "middle",
      nameGap: 30
    },
    yAxis: {
      type: "value",
      min: yMin,
      max: yMax,
      minInterval: 1.0,
      splitNumber: 10,
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: (value: number) => {
          // 只显示主要刻度：-16.30, -16.00, -15.00, -14.00, -13.00, -12.00, -11.00, -10.00, -9.00, -8.20
          const mainTicks = [-16.3, -16.0, -15.0, -14.0, -13.0, -12.0, -11.0, -10.0, -9.0, -8.2];
          if (mainTicks.some(tick => Math.abs(value - tick) < 0.01)) {
            return value.toFixed(2);
          }
          return "";
        }
      },
      nameLocation: "middle",
      nameGap: 50
    },
    series: [
      // 外层置信带区域（较浅）
      {
        name: "confidence-band-outer",
        type: "line",
        data: confidenceBandDataOuter,
        lineStyle: {
          opacity: 0
        },
        areaStyle: {
          color: "rgba(200, 180, 220, 0.15)" // 浅紫色，较浅
        },
        z: 1,
        showSymbol: false,
        silent: true
      },
      // 内层置信带区域（较深）
      {
        name: "confidence-band-inner",
        type: "line",
        data: confidenceBandDataInner,
        lineStyle: {
          opacity: 0
        },
        areaStyle: {
          color: "rgba(200, 180, 220, 0.3)" // 浅紫色，较深
        },
        z: 1,
        showSymbol: false,
        silent: true
      },
      // 对角线参考线 (y=x)
      {
        name: "reference-line",
        type: "line",
        data: [
          [Math.min(xMin, yMin), Math.min(xMin, yMin)],
          [Math.max(xMax, yMax), Math.max(xMax, yMax)]
        ],
        lineStyle: {
          color: "rgba(200, 180, 220, 0.7)", // 浅紫色
          width: 1.5,
          type: "solid"
        },
        showSymbol: false,
        z: 2,
        silent: true
      },
      // 误差条
      // ...errorBarSeries,
      // Retrospective 散点
      {
        name: "Retrospective",
        type: "scatter",
        data: retrospectiveData.map(d => [d[0], d[1]]),
        symbol: "rect",
        symbolSize: 12,
        itemStyle: {
          color: "#1f77b4", // 蓝色
          borderWidth: 0 // 无边框
        },
        z: 3
      },
      // Prospective 散点（空数据，仅用于图例）
      {
        name: "Prospective",
        type: "scatter",
        data: [],
        symbol: "rect",
        symbolSize: 12,
        itemStyle: {
          color: "#00ced1", // 青色
          borderWidth: 0 // 无边框
        },
        z: 3
      }
    ]
  };

  chartInstance.setOption(option);
};

const resizeChart = () => {
  chartInstance?.resize();
};

onMounted(() => {
  nextTick(() => {
    initChart();
    window.addEventListener("resize", resizeChart);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeChart);
  chartInstance?.dispose();
});
</script>

<template>
  <div ref="chartRef" class="correlation-echarts-container" />
</template>

<style lang="scss" scoped>
.correlation-echarts-container {
  width: 600px;
  height: 600px;
  margin: 0 auto;
}
</style>
