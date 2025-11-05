<template>
  <div v-if="if_show" class="">
    <div :id="chart_id" />
  </div>
</template>
<script>
import * as echarts from "echarts";
import { reactive } from "vue";
export default {
  name: "HistogramChart",
  props: {
    data_list: {
      type: Array,
      default: function () {
        return [2, 5, 7, 6, 7, 6, 3, 2, 4, 6, 78, 8, 5, 4, 4, 2, 2, 4, 67, 78, 8, 65, 5, 6, 7, 8, 0, 9, 0, 9, 12, 12, 12, 0, 3, 4, 21, 1, 32, 2, 12, 21, 21, 1, 1, 2, 23, 33, 4];
      }
    },
    update_flag: {
      type: Boolean,
      default: false
    },
    bi_category_list: {
      type: Array,
      default: function () {
        return [];
      }
    },
    if_recalc: {
      type: Boolean,
      default: false
    },
    if_processed: {
      type: Boolean,
      default: false
    },
    reclac_key: {
      type: String
    },
    title: {
      type: String,
      default: "Binding Affinity"
    },
    if_title: {
      type: Boolean,
      default: true
    },
    if_show: {
      type: Boolean,
      default: true
    },
    if_tooltip: {
      type: String,
      default: "mousemove|click"
    },
    if_axis: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: "auto"
    },
    width: {
      type: String,
      default: "auto"
    },
    chart_height: {
      type: String,
      default: "auto"
    },
    bottom_px: {
      type: String,
      default: "20px"
    },
    top_px: {
      type: String,
      default: "25px"
    },
    right_px: {
      type: String,
      default: "50px"
    },
    chart_id: {
      type: String,
      default: "charts_id"
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    offset: {
      type: Number,
      default: 0
    },
    scale: {
      type: Number,
      default: 1
    },
    if_update_minmax: {
      type: Boolean,
      default: false
    },
    if_formatter: {
      type: Boolean,
      default: false
    },
    padNum: {
      type: Number,
      default: -70
    },
    x_name: {
      type: String
    },
    x_units: {
      type: String
    },
    y_name: {
      type: String,
      default: "Counts"
    },
    barWidth: {
      type: Number,
      default: 15
    },
    label: {
      type: String,
      default: ""
    },
    minInterval: {
      type: String || Number,
      default: false
    }
  },
  setup(props, context) {
    const isFormatter = reactive(props.if_formatter);
    return { context, isFormatter };
  },
  mounted() {
    const chart = document.getElementById(this.chart_id);
    chart.innerHTML = "";
    const chart_main = document.createElement("div");
    chart_main.style.height = this.height;
    chart_main.style.width = this.width;
    chart.append(chart_main);

    this.$nextTick(() => {
      this.myChart = echarts.init(chart_main);
      const json = this.draw_normal(this.data_list, this.title);
      this.draw_chart_normal_main(json);
      const myChart = document.getElementById(this.chart_id).childNodes;
      window.addEventListener("resize", () => {
        for (let i = 0; i < myChart.length; i++) {
          echarts.init(myChart[i]).resize();
        }
      });
      window.onresize = myChart.resize;
    });
  },
  methods: {
    changeSize() {
      const myChart = document.getElementById(this.chart_id).childNodes;
      for (let i = 0; i < myChart.length; i++) {
        echarts.init(myChart[i]).resize();
      }
    },
    rechart() {
      const json = this.draw_normal(this.data_list, this.title);
      this.draw_chart_normal_main(json);
    },
    draw_chart_normal_main(json) {
      const option = json;
      if (option && typeof option === "object") {
        this.myChart.setOption(option);
      }
    },
    draw_normal(data, name) {
      // console.log('data', data)
      const ret_dict = { x: [], y: [] };
      let interval;
      if (this.if_processed) {
        if (!data.amount) {
          return;
        }
        if (data.amount.length) {
          interval = (parseFloat(data.max) - parseFloat(data.min)) / data.amount.length;
        } else {
          data.amount.push(1);
          interval = 0;
        }

        for (let l = 0; l < data.amount.length; l++) {
          ret_dict.y.push(data.amount[l]);
          ret_dict.x.push(parseInt((parseFloat(data.min) + interval * l) * 1000) / 1000);
        }
        if (this.if_update_minmax && this.update_flag) {
          this.context.emit("update:min", Math.round(data.min * 1000) / 1000 - 0.1);
          this.context.emit("update:max", Math.round(data.max * 1000) / 1000 + 0.1);
          this.context.emit("update:offset", data.min);
          this.context.emit("update:scale", 100 / (data.max - data.min));
        }
      } else {
        if (this.if_recalc) {
          if (!this.reclac_key) {
            return;
          }
          const new_data = [];
          for (let j = 0; j < data.length; j++) {
            new_data.push(data[j][this.reclac_key]);
          }
          data = new_data;
        }
        const tmp_dict = {};

        let minx;
        let maxx;

        if (this.bi_category_list.indexOf(this.reclac_key) !== -1) {
          minx = 0;
          maxx = 1;
        } else {
          minx = Math.min(...data);
          maxx = Math.max(...data);
        }

        if (this.if_update_minmax && this.update_flag) {
          this.context.emit("update:min", Math.round(minx * 1000) / 1000 - 0.1);
          this.context.emit("update:max", Math.round(maxx * 1000) / 1000 + 0.1);
          this.context.emit("update:offset", minx);
          this.context.emit("update:scale", 100 / (maxx - minx));
        }

        interval = (maxx - minx) / 50;
        if (interval === 0) {
          interval += 1e-7;
        }
        let tmp = 0;

        for (let i = 0; i < data.length; i++) {
          tmp = parseInt(parseInt(data[i] / interval) * interval * 100) / 100;
          if (tmp in tmp_dict) {
            tmp_dict[tmp] += 1;
          } else {
            tmp_dict[tmp] = 1;
          }
        }
        for (let k = 0; k < 50; k++) {
          tmp = parseInt(((parseInt(maxx / interval) * interval * k) / 50) * 100) / 100;

          if (tmp in tmp_dict) {
            continue;
          } else {
            tmp_dict[tmp] = 0;
          }
        }
        const key_list = Object.keys(tmp_dict);
        key_list.sort(function (a, b) {
          return a - b;
        });
        for (let key = 0; key < key_list.length; key++) {
          ret_dict.x.push(key_list[key]);
          ret_dict.y.push(tmp_dict[key_list[key]]);
        }
      }
      if (this.isFormatter) {
        ret_dict.x.push(data.max.toFixed(3));
      }

      const json = this.generate_normal_json(ret_dict, name);
      return json;
    },
    generate_normal_json(ret_dict, name) {
      console.log(ret_dict);
      const title = name;
      const option = {
        grid: {
          left: 50,
          right: this.right_px,
          bottom: this.bottom_px,
          top: this.top_px
          // height: this.chart_height
          // containLabel: "true",
        },
        series: [
          {
            name: "numbers",
            type: "bar",
            barWidth: this.barWidth + "%",
            data: ret_dict.y,
            label: {
              show: this.label,
              position: this.label
            }
          }
        ]
      };
      if (this.if_title) {
        option.title = {
          text: title,
          left: "center",
          textStyle: {
            color: "#333",
            fontSize: "14px"
          },
          padding: [5, 0, 10, 0]
        };
      }
      if (this.isFormatter) {
        option.tooltip = {
          trigger: "item",
          formatter: function (parms, api) {
            const str = `<p>${parms.name} ~ ${ret_dict.x[Number(api.split("_")[2]) + 1]}</p>
            <p>
              <div style="background-color: rgb(84,112,198);border-radius: 50%;width: 10px;height: 10px;display: inline-block;"></div>
               number
              <b style="margin-left: 20px;">${ret_dict.y[Number(api.split("_")[2])]}</b>
            </p>`;
            return str;
          },
          triggerOn: this.if_tooltip,
          axisPointer: {
            type: "shadow"
          }
        };
        option.xAxis = [
          {
            show: this.if_axis,
            type: "category",
            name: this.x_name + this.x_units,
            nameLocation: "middle",
            nameGap: 35,
            axisLabel: {
              padding: [0, 0, 0, this.padNum]
            },
            data: ret_dict.x
            // axisTick: {
            //   alignWithLabel: 'true'
            // }
          }
        ];
      } else {
        option.tooltip = {
          trigger: "axis",
          triggerOn: this.if_tooltip,
          axisPointer: {
            type: "shadow"
          }
        };
        option.xAxis = [
          {
            show: this.if_axis,
            type: "category",
            name: this.x_name + this.x_units,
            nameLocation: "middle",
            nameGap: 30,
            data: ret_dict.x,
            axisTick: {
              alignWithLabel: "true"
            }
          }
        ];
      }
      option.yAxis = [
        {
          show: this.if_axis,
          type: "value",
          name: this.y_name,
          nameLocation: "middle",
          nameGap: 30,
          splitLine: {
            show: true
          },
          axisLine: {
            show: true
          },
          // max: null,
          max: function (value) {
            if (value.max < 5) {
              return 5;
            } else {
              return null;
            }
          },
          minInterval: this.minInterval
        }
      ];
      return option;
    }
  }
};
</script>

<style lang="css" scoped></style>
