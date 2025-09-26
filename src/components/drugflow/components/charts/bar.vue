<template>
  <div v-if="if_show" class="">
    <div :id="chart_id" />
  </div>
</template>
<script>
import * as echarts from "echarts";

export default {
  name: "barChart",
  props: {
    data_list: {
      type: Array,
      default: function () {
        return [
          [
            { name: "name_0", value: 10 },
            { name: "name_1", value: 20 },
            { name: "name_2", value: 30 }
          ]
        ];
      }
    },
    if_title: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: "Residue"
    },
    height: {
      type: String,
      default: "300px"
    },
    width: {
      type: String,
      default: "auto"
    },
    chart_id: {
      type: String,
      default: "charts_id"
    },
    if_show: {
      type: Boolean,
      default: true
    },
    num: {
      type: Number
    },
    y_name: {
      type: String,
      default: "Counts"
    },
    padNum: {
      type: Number,
      default: 0
    },
    tooltip: {
      type: Boolean,
      default: true
    },
    task_type: {
      type: String,
      default: "H"
    }
  },
  setup(props, context) {
    const myChart = "";
    return { context, myChart };
  },
  mounted() {
    // console.log(this.task_type)
    const chart = document.getElementById(this.chart_id);
    chart.innerHTML = "";
    const chart_main = document.createElement("div");
    chart_main.style.height = this.height;
    chart_main.style.width = this.width;
    chart.append(chart_main);
    this.$nextTick(() => {
      this.myChart = echarts.init(chart_main);
      this.drawChart(this.data_list, this.myChart, this.task_type);
    });
  },
  methods: {
    resize() {
      this.myChart.resize();
    },
    drawChart(data, myChart, task_type) {
      const dimensions = ["product"];
      // const chartData = []
      Object.keys(data).forEach(key => {
        Object.keys(data[key]).forEach(keys => {
          if (keys !== "product") {
            dimensions.push(keys);
          }
        });
      });
      const series = [];
      for (let i = 0; i < this.num; i++) {
        series.push({
          type: "bar",
          barWidth: "25%",
          barMinHeight: 2,
          label: {
            show: true,
            position: "top"
          }
          // barGap: '100%',
        });
      }
      // 绘制图表
      myChart.setOption({
        width: "70%",
        legend: {
          orient: "vertical",
          left: "right"
        },
        tooltip: {
          show: this.tooltip,
          trigger: "item",
          formatter: function (parms, api) {
            let str = "";
            if (task_type === "H") {
              str += `<p>${parms.name} ~ ${data[parms.dataIndex + 1].product}</p>
                <p>
                  <div style="border-radius: 50%;width: 10px;height: 10px;display: inline-block;background: ${parms.color}"></div>
                   ${parms.seriesName}
                   <b style="margin-left: 20px;">${data[parms.dataIndex][parms.seriesName]}</b>
                </p>`;
            } else {
              str += `<p>${parms.name}</p>
                <p>
                  <div style="border-radius: 50%;width: 10px;height: 10px;display: inline-block;background: ${parms.color}"></div>
                   ${parms.seriesName}
                   <b style="margin-left: 20px;">${data[parms.dataIndex][parms.seriesName]}</b>
                </p>`;
            }
            return str;
          },
          // triggerOn: this.if_tooltip,
          axisPointer: {
            type: "shadow"
          }
        },
        dataset: {
          dimensions,
          source: data
        },
        xAxis: {
          type: "category",
          axisLabel: {
            padding: [0, 0, 0, this.padNum]
          }
        },
        grid: {
          left: "5%",
          right: "5%",
          bottom: "5%",
          containLabel: true
        },
        yAxis: [
          {
            name: this.y_name,
            nameLocation: "center",
            nameGap: 40,
            axisLine: {
              show: true
            }
          }
        ],
        series
      });
    }
  }
};
</script>

<style lang="css" scoped></style>
