<script setup lang="ts">
import * as echarts from "echarts";
import { ref, onMounted, onUnmounted, nextTick } from "vue";

defineOptions({
  name: "ChartOne"
});

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// 根据图片描述的数据点
const timeData = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

const forwardData = [-11.6, -11.5, -11.3, -11.1, -11.3, -11.3, -11.1, -11.1, -11.0, -11.1, -11.1];
const forwardUpper = forwardData.map((v, i) => v + 0.15);
const forwardLower = forwardData.map((v, i) => v - 0.15);

const backwardData = [-11.2, -10.8, -11.0, -10.9, -10.9, -11.0, -11.1, -11.0, -11.0, -11.0, -11.1];
const backwardUpper = backwardData.map((v, i) => v + 0.15);
const backwardLower = backwardData.map((v, i) => v - 0.15);

const movingData = [-11.5, -11.3, -11.2, -10.7, -11.2, -12.0, -11.0, -10.5, -11.4, -10.6, -11.1];
const movingUpper = movingData.map((v, i) => v + 0.3);
const movingLower = movingData.map((v, i) => v - 0.3);

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  // 构建置信区间数据：将上下边界合并成一个数组
  const buildConfidenceArea = (upper: number[], lower: number[], time: number[]) => {
    return upper
      .map((val, idx) => [time[idx], val])
      .concat(
        lower
          .slice()
          .reverse()
          .map((val, idx) => [time[time.length - 1 - idx], val])
      );
  };

  const forwardArea = buildConfidenceArea(forwardUpper, forwardLower, timeData);
  const backwardArea = buildConfidenceArea(backwardUpper, backwardLower, timeData);
  const movingArea = buildConfidenceArea(movingUpper, movingLower, timeData);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      }
    },
    legend: {
      data: ["forward", "backward", "moving"],
      top: 10,
      left: 10
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "15%",
      top: "20%",
      containLabel: false
    },
    xAxis: {
      type: "value",
      name: "Time (ns)",
      nameLocation: "middle",
      nameGap: 30,
      min: 0,
      max: 5,
      splitNumber: 5,
      axisLabel: {
        formatter: "{value}"
      }
    },
    yAxis: {
      type: "value",
      name: "ΔG (kJ/mol)",
      nameLocation: "middle",
      nameGap: 50,
      min: -12.0,
      max: -10.25,
      splitNumber: 7,
      axisLabel: {
        formatter: "{value}"
      }
    },
    series: [
      // forward 置信区间阴影
      {
        name: "forward-area",
        type: "line",
        data: forwardArea,
        lineStyle: {
          opacity: 0
        },
        areaStyle: {
          color: "rgba(31, 119, 180, 0.3)"
        },
        z: 1,
        showSymbol: false,
        silent: true
      },
      // forward 主折线
      {
        name: "forward",
        type: "line",
        data: forwardData.map((val, idx) => [timeData[idx], val]),
        lineStyle: {
          color: "#1f77b4",
          width: 2
        },
        itemStyle: {
          color: "#1f77b4"
        },
        symbol: "circle",
        symbolSize: 4,
        z: 3
      },
      // backward 置信区间阴影
      {
        name: "backward-area",
        type: "line",
        data: backwardArea,
        lineStyle: {
          opacity: 0
        },
        areaStyle: {
          color: "rgba(255, 127, 14, 0.3)"
        },
        z: 1,
        showSymbol: false,
        silent: true
      },
      // backward 主折线
      {
        name: "backward",
        type: "line",
        data: backwardData.map((val, idx) => [timeData[idx], val]),
        lineStyle: {
          color: "#ff7f0e",
          width: 2
        },
        itemStyle: {
          color: "#ff7f0e"
        },
        symbol: "circle",
        symbolSize: 4,
        z: 3
      },
      // moving 置信区间阴影
      {
        name: "moving-area",
        type: "line",
        data: movingArea,
        lineStyle: {
          opacity: 0
        },
        areaStyle: {
          color: "rgba(44, 160, 44, 0.3)"
        },
        z: 1,
        showSymbol: false,
        silent: true
      },
      // moving 主折线
      {
        name: "moving",
        type: "line",
        data: movingData.map((val, idx) => [timeData[idx], val]),
        lineStyle: {
          color: "#2ca02c",
          width: 2
        },
        itemStyle: {
          color: "#2ca02c"
        },
        symbol: "circle",
        symbolSize: 4,
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
  <div ref="chartRef" class="chart-container" />
</template>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
