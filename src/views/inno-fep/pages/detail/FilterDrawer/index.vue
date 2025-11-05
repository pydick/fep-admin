<template>
  <el-drawer class="frame1 show" size="40%" :modelValue="if_show" direction="rtl" :with-header="false" @close="close_box">
    <div class="messbox_inner">
      <flexDiv class="flex_between">
        <div>
          <p class="text13rem text_c2 weight600" style="margin: 0; line-height: 32px">高级筛选</p>
          <p class="text09rem text_c7" style="margin: 0">创建您的过滤器</p>
        </div>
        <flexDiv class="flex_column" style="align-items: flex-end">
          <el-button circle plain size="small" style="margin-bottom: 5px" @click="close_box">
            <el-icon>
              <close />
            </el-icon>
          </el-button>
        </flexDiv>
      </flexDiv>
      <el-divider style="margin-top: 1rem; margin-bottom: 1rem" />
    </div>

    <div>
      <el-card body-style="padding: 0.5rem" shadow="never" style="margin-bottom: 1rem">
        <el-row>
          <el-col :span="6">
            <span class="text08rem text_c7">筛选查询</span>
            <el-divider direction="vertical" />
          </el-col>
          <el-col :span="18">
            <span class="text08rem text_c7">{{ filter_string }}</span>
            <span class="text08rem text_c7">{{ selectedResidue.map(item => item.name).join(",") }}</span>
          </el-col>
        </el-row>
      </el-card>
      <el-scrollbar ref="scroll_ref" :max-height="`calc(100vh - 270px)`">
        <el-tabs id="filter_inner" v-model="filter_type" style="border-radius: 4px" type="border-card">
          <el-tab-pane name="property">
            <template #label>
              <div class="flex_def flex_start">
                <span class="text08rem" style="margin-left: 4px">属性</span>
              </div>
            </template>
            <flexDiv v-for="item in value" :key="item.key" :class="{ item_bg: item.num % 2 == 1 }" class="flex_between hover_table" style="padding: 0 10px">
              <div style="height: 95px; margin-top: 5px; width: 20%">
                <p class="text09rem text_c9">属性</p>
                <el-cascader v-if="need_cascad" v-model="item.selected" :filter-method="PinYinScreen" :options="newCascadOptions" :props="casadProp" :show-all-levels="false" filterable @change="cascader_change(item.key, item)" />
                <el-select v-else v-model="item.selected_value" :props="casadProp" filterable @change="cascader_change(item.key, item)">
                  <el-option v-for="item in newCascadOptions" v-show="item.label" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled" />
                </el-select>
              </div>
              <div style="position: relative">
                <histogram :ref="`${item.key}`" v-model:max="item.maxV" v-model:min="item.minV" v-model:offset="item.offset" v-model:scale="item.scale" width="20vw" :chart_id="item.key" :data_list="need_cascad ? array[item.selected[1]] : array[item.selected_value]" :if_axis="false" :if_processed="true" :if_title="false" :if_update_minmax="true" :update_flag="update_flag" chart_height="75%" height="100px" if_tooltip="none" style="height: 100px; opacity: 0.3" />
                <div class="myslider">
                  <el-slider v-model="item.range" :format-tooltip="formatTooltip" range size="small" @input="change_input(item.num)" />
                </div>
                <p class="range_title">范围</p>
                <flexDiv class="range_input">
                  <el-input-number v-model="item.minV" placeholder="min" type="number" step="0.001" size="small" @change="change_slider(item.num, 'minV')" />
                  <div style="width: 10px" />
                  <el-input-number v-model="item.maxV" placeholder="max" type="number" step="0.001" size="small" @change="change_slider(item.num, 'maxV')" />
                </flexDiv>
              </div>

              <el-button :disabled="value?.length <= 1" circle plain type="danger" @click="delete_filter(item.num)">
                <el-icon>
                  <delete />
                </el-icon>
              </el-button>
            </flexDiv>
            <flexDiv class="flex_between" style="margin: 10px 0">
              <el-button :disabled="value?.length >= newCascadOptions?.length" circle type="primary" @click="add_filter">
                <el-icon>
                  <plus />
                </el-icon>
              </el-button>
              <el-button plain size="small" type="primary" @click="reset">重置</el-button>
            </flexDiv>
          </el-tab-pane>
          <el-tab-pane v-if="data_type == 'docking'" name="fgroup">
            <template #label>
              <div class="flex_def flex_start">
                <span class="text08rem" style="margin-left: 4px">相互作用残基</span>
              </div>
            </template>
            <div class="residue">
              <div class="residue-item">
                <div class="residue-item-label">氢健</div>
                <div class="residue-item-content">
                  <el-button v-for="item in residue_list" :key="item.id" :class="{ activerRsidue: item.selected }" size="small" @click="toggleSelection(item)">{{ item.name }}</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-scrollbar>
    </div>
    <el-divider style="margin-top: 1rem; margin-bottom: 1rem" />

    <div>
      <flexDiv class="flex_between">
        <el-button plain size="small" type="primary" @click="close_box">关闭</el-button>
        <flexDiv>
          <el-button type="success" @click="apply">应用</el-button>
        </flexDiv>
      </flexDiv>
    </div>
  </el-drawer>
</template>
<script>
import { computed, reactive, ref, watch, watchEffect } from "vue";
import histogram from "./histogram.vue";
import PinYinMatch from "pinyin-match";

export default {
  name: "filterTable",
  components: {
    histogram
  },
  props: {
    if_show: {
      type: Boolean,
      default: true
    },
    residue_list: {
      type: Array,
      default: function () {
        return [];
      }
    },
    data_type: {
      type: String,
      default: ""
    },
    array: {
      type: Array,
      default: function () {
        return [];
      }
    },
    cascadOptions: {
      type: Array,
      default: function () {
        return [];
      }
    },
    need_cascad: {
      type: Boolean,
      default: true
    },
    bi_list: {
      type: Array,
      default: function () {
        return ["Pgp-inh", "Pgp-sub", "HIA", "F(20%)", "F(30%)", "T12", "CYP1A2-inh", "CYP1A2-sub", "CYP2C19-inh", "CYP2C19-sub", "CYP2C9-inh", "CYP2C9-sub", "CYP2D6-inh", "CYP2D6-sub", "CYP3A4-sub", "CYP3A4-inh", "hERG", "H-HT", "DILI", "Ames", "HLM", "ROA", "FDAMDD", "SkinSen", "Carcinogenicity", "EC", "EI", "Respiratory", "NR-AR", "NR-AR-LBD", "NR-AhR", "NR-Aromatase", "NR-ER", "NR-ER-LBD", "NR-PPAR-gamma", "SR-ARE", "SR-ATAD5", "SR-HSE", "SR-MMP", "SR-p53"];
      }
    },
    default_list: {
      type: Array,
      default: function () {
        return ["LogS", "LogD", "LogP"];
      }
    }
  },
  setup(props, context) {
    const filter_type = ref("property");
    const selectedResidue = ref([]);
    const val = ref();
    const if_error = ref(false);
    const all_num = ref(3);
    const update_flag = ref(true);
    const newCascadOptions = ref();
    const casadProp = {
      expandTrigger: "hover"
    };

    const close_box = () => {
      update_flag.value = false;
      context.emit("update:if_show", false);
    };
    const formatTooltip = val => {
      return val + "%";
    };
    const PinYinScreen = (node, keyword) => {
      if (!!~node.text.indexOf(keyword) || !!~node.text.toUpperCase().indexOf(keyword.toUpperCase())) {
        return true;
      }
      if (PinYinMatch.match(node.label, keyword)) {
        return true;
      }
    };
    const value = reactive([
      {
        selected: props.need_cascad ? [props.cascadOptions[0]?.value, props.cascadOptions[0].children[0]?.value] : props.cascadOptions[0]?.value,
        selected_value: props.cascadOptions[0]?.value,
        range: [0, 100],
        offset: 0,
        scale: 100,
        minV: 1e8,
        maxV: -1,
        key: "filter_0",
        num: 0
      }
    ]);
    if (!value[0].selected_value) {
      const stop = watchEffect(() => {
        if (props.cascadOptions && props.cascadOptions.length > 0) {
          value[0].selected_value = props.cascadOptions[0]?.value;
          stop();
        }
      });
    }
    watch(value, () => {
      newCascadOptions.value = JSON.parse(JSON.stringify(props.cascadOptions));
      // console.log(newCascadOptions.value)
      for (let i = 0; i < value.length; i++) {
        if (props.need_cascad) {
          newCascadOptions.value.forEach((items, indexs) => {
            if (items.value === value[i].selected[0]) {
              items.children.forEach((item, index) => {
                if (item.value === value[i].selected[1]) {
                  newCascadOptions.value[indexs].children[index].disabled = true;
                }
              });
            }
          });
        } else {
          newCascadOptions.value.forEach((items, indexs) => {
            // console.log(items,indexs)
            // console.log(items)
            // console.log(value[i].selected_value)
            if (items.value === value[i].selected_value) {
              newCascadOptions.value[indexs].disabled = true;
              // console.log(items,'========================')
              // console.log(newCascadOptions.value[indexs])
            }
          });
        }
      }
    });
    const filter_string = computed(() => {
      let tmp_string = "";
      for (let i = 0; i < value.length; i++) {
        let show_value;
        if (props.need_cascad) {
          props.cascadOptions.forEach(vals => {
            if (value[i].selected[0] === vals.value) {
              vals.children.forEach(val => {
                if (value[i].selected[1] === val.value) {
                  show_value = val.label;
                }
              });
            }
          });
          if (show_value) {
            if (Math.round(props.array[value[i].selected[1]]?.min * 1000) / 1000 < Math.round(value[i].minV * 1000) / 1000 || Math.round(props.array[value[i].selected[1]]?.max * 1000) / 1000 > Math.round(value[i].maxV * 1000) / 1000) {
              tmp_string += Math.round(value[i].minV * 1000) / 1000 + " ≤ " + show_value + " ≤ " + Math.round(value[i].maxV * 1000) / 1000 + "; ";
            } else {
              tmp_string += "";
            }
          }
        } else {
          props.cascadOptions.forEach(val => {
            if (value[i].selected_value === val.value) {
              show_value = val.label;
            }
          });
          // show_value = value[i].selected_value
          if (show_value) {
            if (Math.round(props.array[value[i].selected_value]?.min * 1000) / 1000 < Math.round(value[i].minV * 1000) / 1000 || Math.round(props.array[value[i].selected_value]?.max * 1000) / 1000 > Math.round(value[i].maxV * 1000) / 1000) {
              tmp_string += Math.round(value[i].minV * 1000) / 1000 + " ≤ " + show_value + " ≤ " + Math.round(value[i].maxV * 1000) / 1000 + "; ";
            } else {
              tmp_string += "";
            }
          }
        }
      }
      return tmp_string;
    });
    return {
      update_flag,
      value,
      all_num,
      val,
      casadProp,
      if_error,
      close_box,
      context,
      formatTooltip,
      filter_string,
      newCascadOptions,
      PinYinScreen,
      filter_type,
      selectedResidue
    };
  },
  watch: {
    if_show(newV, oldV) {
      this.context.emit("update:if_show", newV);
    }
  },
  mounted() {},
  methods: {
    // 点击残基按钮
    toggleSelection(item) {
      item.selected = !item.selected;
      this.selectedResidue = this.residue_list.filter(item => item.selected == true);
      // console.log(this.selectedResidue)
    },
    apply() {
      const ret_dict = { list: [], filter: this.filter_string, function_group: this.selectedResidue };
      for (let i = 0; i < this.value.length; i++) {
        let tmp_name;
        if (this.need_cascad) {
          tmp_name = this.value[i].selected[1];
        } else {
          tmp_name = this.value[i].selected_value;
        }
        ret_dict.list.push({
          name: tmp_name,
          min_max_list: [this.value[i].minV - 0.1, this.value[i].maxV + 0.1]
        });
      }
      for (let j = this.value.length; j > 0; j--) {
        if (this.value[j - 1].minV === 0 && this.value[j - 1].maxV === 0) {
          this.value.splice(j - 1, 1);
        }
      }
      this.context.emit("change_table_for_filter", ret_dict);
      this.update_flag = false;
      this.context.emit("update:if_show", false);
    },
    add_filter() {
      this.update_flag = true;
      const length = this.value.length;
      const new_key = "filter_" + this.all_num;
      console.log(Object.keys(this.array)[0]);
      this.value.push({
        // selected: [this.cascadOptions[0].value, 'LogS'],
        // selected_value: Object.keys(this.array)[1],
        selected: [],
        selected_value: "",
        range: [0, 100],
        offset: 0,
        scale: 1,
        minV: 0,
        maxV: 0,
        key: new_key,
        num: length
      });
      this.all_num += 1;
      this.$nextTick(() => {
        const tmp = document.getElementById("filter_inner");
        this.$refs.scroll_ref.scrollTo(0, tmp.scrollHeight);
      });
    },
    delete_filter(num) {
      if (this.value.length > 1) {
        this.value.splice(num, 1);
        for (let i = 0; i < this.value.length; i++) {
          this.value[i].num = i;
        }
      }
    },
    cascader_change(chart_ref_name, item) {
      this.update_flag = true;
      this.$nextTick(() => {
        this.$refs[`${chart_ref_name}`][0].rechart();
      });
      item.range = [0, 100];
    },
    change_slider(num, min_max_type) {
      const tmp_num = (this.value[num][min_max_type] - this.value[num].offset) * this.value[num].scale;
      if (min_max_type === "minV") {
        this.value[num].range[0] = tmp_num;
      } else {
        this.value[num].range[1] = tmp_num;
      }
    },
    change_input(num) {
      const minv_tmp = this.value[num].range[0] / this.value[num].scale + this.value[num].offset;
      const maxv_tmp = this.value[num].range[1] / this.value[num].scale + this.value[num].offset;
      this.value[num].minV = Math.round(minv_tmp * 1000) / 1000 - 0.1;
      this.value[num].maxV = Math.round(maxv_tmp * 1000) / 1000 + 0.1;
    },
    reset() {
      this.update_flag = true;
      const length = this.value.length;
      this.value.splice(0, length);
      const tmp_list = this.default_list;
      for (let i = 0; i < 1; i++) {
        const new_key = "filter_" + this.all_num;
        const tmp_length = this.value.length;
        this.value.push({
          selected: ["Physicochemical Property", tmp_list[i]],
          selected_value: tmp_list[i],
          range: [0, 100],
          offset: 0,
          scale: 1,
          minV: 0,
          maxV: 0,
          key: new_key,
          num: tmp_length
        });
        this.all_num += 1;
      }
    }
  }
};
</script>

<style lang="css" scoped>
.frame1 {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
  z-index: -1000;
  width: 100vw;
  height: 100vh;
}

.messbox {
  width: 60%;
  min-width: 500px;
  max-width: 750px;
  font-size: 1.1rem;
  background-color: #fff;
  padding: 1rem 0;
  border-radius: 4px;
}

.messbox_inner {
  max-height: 650px;
  overflow: auto;
  padding: 0 1rem;
}

.show {
  opacity: 1;
  z-index: 1000;
}

.bg_chart {
  position: absolute;
}

.myslider {
  position: absolute;
  bottom: 5px;
  width: calc(100% - 18px);
  margin: 0 9px;
}

.range_title {
  margin: 0;
  position: absolute;
  top: 5px;
  left: 0;
  font-size: 14px;
  color: #999;
}

.range_input {
  position: absolute;
  top: 5px;
  right: 0;
}

.item_bg {
  background: #fafafa;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.hover_table:hover {
  background: #f5f7fa;
}
.residue {
  width: 100%;
  /* background-color: red; */
  display: flex;
  flex-direction: column;
}
.residue-item {
  width: 100%;
  min-height: 30px;
  /* background-color: pink; */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  /* align-items: center; */
}
.residue-item .residue-item-label {
  width: 12%;
  min-height: 30px;
  /* background-color: antiquewhite; */
  font-size: 0.8rem;
  color: #333;
  line-height: 30px;
}
.residue-item .residue-item-content {
  width: 88%;
  /* min-height: 30px; */
  display: flex;
  flex-wrap: wrap;
}
.residue-item .residue-item-content .el-button {
  margin-top: 6px;
  box-sizing: border-box;
  width: 20%;
  margin-left: 4%;
}
/* .residue-item .residue-item-content .el-button:nth-child() */
.activerRsidue {
  background-color: rgb(87, 148, 255) !important;
  border-color: rgb(87, 148, 255) !important;
  color: #fff !important;
  box-sizing: border-box;
}
</style>

<style lang="css">
.range_input input {
  max-width: 54px;
  padding: 0;
  height: 24px !important;
}
</style>
