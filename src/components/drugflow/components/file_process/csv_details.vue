<template>
  <div style="position: relative; height: 100%">
    <el-tabs v-model="activeName" class="inner_tabs" type="border-card" style="height: 100%">
      <div style="position: absolute; top: 4px; right: 0.5rem; display: flex">
        <div v-if="is_download">
          <el-button v-if="!is_dialog" style="margin-left: 0.5rem" type="info" @click="download">{{ t("result.下载") }}</el-button>
          <el-button v-else style="margin-left: 0.5rem" type="info" @click="if_show = !if_show">{{ t("result.下载") }}</el-button>
        </div>
        <creation_task v-if="new_task" :dataset_id="dataset_id" />
      </div>
      <div v-if="if_show" class="messbox_frame" :class="{ show: if_show === true }" style="opacity: unset; z-index: 999">
        <div class="messbox">
          <div class="flex_def flex_between" style="margin-bottom: 1rem">
            <p style="margin: 0" class="text11rem text_c2">{{ t("result.download_title") }}</p>
            <el-button circle type="primary" plain @click="close_message_box">
              <el-icon><CloseBold /></el-icon>
            </el-button>
          </div>

          <div class="">
            <el-radio-group v-model="download_class" class="flex_def flex_column">
              <el-radio :label="0">
                <span v-if="data_name.split('.').pop() === 'pdb'">{{ t("result.pdb下载部分") }}</span>
                <span v-else>{{ t("result.下载部分") }}</span>
              </el-radio>
              <el-radio :label="1">
                <span v-if="data_name.split('.').pop() === 'pdb'">{{ t("result.pdb下载全部") }}</span>
                <span v-else>{{ t("result.下载全部") }}</span>
              </el-radio>
            </el-radio-group>
            <div v-if="data_name.split('.').pop() === 'pdb'" class="hint">{{ t("result.protein下载提示") }}</div>
          </div>

          <div class="flex_def flex_end">
            <el-button type="success" @click="download()">{{ t("result.确认") }}</el-button>
          </div>
        </div>
      </div>
      <el-tab-pane :label="t('qsar.文件内容')" name="first" style="height: 100%">
        <vxe-toolbar ref="xToolbar">
          <template #buttons>
            <vxe-button :content="t('result.显示隐藏上传列')" status="primary" @click="drawer_data = true" />
            <vxe-button :status="show2D ? 'primary' : ''" style="padding-right: 0" :style="{ paddingRight: data_name.split('.').pop() !== 'sdf' ? '0' : '1em' }" @click="show_2D">
              2D Structure
              <el-select v-if="data_name.split('.').pop() !== 'sdf'" ref="select" v-model="smiles" style="width: 6rem" @change="show2D = true">
                <el-option v-for="item in smiles_label" :key="item" :label="item.new_name ? item.new_name : item" :value="item.new_name ? item.new_name : item" />
              </el-select>
            </vxe-button>
            <!--          <vxe-button status="primary" content="新增" @click="insertEvent"></vxe-button>-->
            <!--          <vxe-button status="danger" content="删除" @click="deleteSelectEvent"></vxe-button>-->
            <vxe-button @click="clear">清除排序</vxe-button>
          </template>
        </vxe-toolbar>
        <el-checkbox-group v-model="smiles_id_selection" style="height: 100%">
          <div style="height: calc(100% - 100px)">
            <vxe-table ref="xTable" style="height: 100%" :checkbox-config="{ reserve: true }" :column-config="{ resizable: true }" :data="tableData" :edit-config="is_edit ? { trigger: 'click', mode: 'cell' } : { enabled: false }" :keep-selected="true" :loading="loading" :row-config="{ height: show2D ? svgSize : 30 }" :scroll-y="{ mode: 'wheel' }" :sort-config="{ multiple: true, chronological: true, remote: true }" border class="mytable-scrollbar" height="auto" show-header-overflow="tooltip" show-overflow showIcon="false" @edit-closed="editClosedEvent" @edit-actived="editActived" @sort-change="sortChangeEvent" @resizable-change="resize">
              <!--        :checkbox-config="{ labelField: 'id'}"-->
              <vxe-column type="checkbox" width="75">
                <template v-slot:header>
                  <!--            <el-checkbox-->
                  <!--                v-model="checkAll"-->
                  <!--                :indeterminate="isIndeterminate"-->
                  <!--                @change="handleCheckAllChange"-->
                  <!--            ></el-checkbox-->
                  <!--            >-->
                  <vxe-checkbox v-model="checkAll" :indeterminate="isIndeterminate" size="small" @change="handleCheckAllChange" />
                  <!--            <span @click="handleCheckAllChange">全选</span>-->
                </template>
                <template #checkbox="{ row, rowIndex }">
                  <el-checkbox :label="row.id" style="margin-left: 0.2rem">
                    {{ (current_page - 1) * page_size + rowIndex + 1 }}
                  </el-checkbox>
                </template>
              </vxe-column>
              <!--        <vxe-column type="seq" title="ID" width="60"></vxe-column>-->
              <vxe-column v-if="show2D" :title="t('result.structure')" min-width="200" width="200">
                <template #default="{ row }">
                  <svgBox :height="svgSize + 'px'" :smiles="row.dynamic[smiles]" :width="svgSize + 'px'" />
                </template>
              </vxe-column>
              <vxe-column v-for="(item, index) in arr_same(tableLabels, left_checklist)" :key="item" :edit-render="{}" :field="item.ref" :title="item.new_name" align="center" min-width="125" show-overflow sortable>
                <template v-slot:header>
                  <div v-show="!item.edit" style="display: flex; align-items: center">
                    <el-dropdown trigger="click" @command="handleCommand">
                      <span style="font-size: 0.7rem; line-height: 0.7rem; text-align: center; display: inline-block; width: 0.8rem; height: 0.8rem; border: 1px solid #333333; cursor: pointer">
                        {{ item.dtype === "float64" ? "F" : item.dtype === "int64" ? "I" : "S" }}
                        <!--                    {{item}}-->
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu v-if="is_edit">
                          <el-dropdown-item :command="beforeHandleCommand(item.dataset_col_id, 'object')">String</el-dropdown-item>
                          <el-dropdown-item :command="beforeHandleCommand(item.dataset_col_id, 'int64')">Integer</el-dropdown-item>
                          <el-dropdown-item :command="beforeHandleCommand(item.dataset_col_id, 'float64')">Floating</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <span :title="item.new_name" style="overflow: hidden; text-overflow: ellipsis; margin: 0 0.3rem">{{ item.new_name }}</span>
                    <el-icon v-if="is_edit" :size="text_size === 'huge' ? 20 : 14" style="cursor: pointer" @click="open(item.dataset_col_id, index)">
                      <Edit />
                    </el-icon>
                  </div>
                  <vxe-input v-show="item.edit" :ref="'TagInput_' + item.dataset_col_id + index" v-model="item.new_name" type="text" @blur="change_labels_name(item.dataset_col_id, index)" />
                </template>
                <template #default="{ row }">
                  <span>{{ row.dynamic[item.new_name] === "nan" ? "-" : row.dynamic[item.new_name] }}</span>
                </template>
                <template #edit="{ row }">
                  <vxe-input v-model="row.dynamic[item.new_name]" type="text" />
                </template>
              </vxe-column>
            </vxe-table>
          </div>

          <p style="font-size: 0.7rem">line:{{ filtered_number }}, column:{{ tableLabels.length }}</p>
          <el-pagination :current-page="current_page" :page-size="page_size" :page-sizes="[50, 100, 200]" :total="filtered_number" align="center" layout="total, sizes, prev, pager, next, jumper" style="margin-top: 19px; overflow-x: auto" @size-change="page_size_change" @current-change="current_page_change" />
        </el-checkbox-group>
      </el-tab-pane>
      <el-tab-pane v-if="is_overview" :label="t('qsar.数据概览')" name="second" style="height: 100%; overflow: hidden; overflow-y: auto">
        <div v-if="activeName === 'second'">
          <div v-for="(item, key) in chartH" :key="key">
            <el-row style="margin: 0.5rem">
              <el-col :span="6">
                <div class="flex_def flex_start" style="height: 100%">
                  <span :title="key" class="text13rem text_c5 weight500 text_ellipsis" style="margin-left: 1rem">
                    {{ key }}
                  </span>
                </div>
              </el-col>
              <el-col :span="18">
                <div class="flex_def flex_wrap">
                  <div v-for="(items, keys) in item.desc" :key="keys" style="width: 33%; padding: 0 0.3rem">
                    <div v-if="keys !== 'amount'" class="flex_def flex_start">
                      <div class="text08rem text_c5 weight500" style="width: 40%">{{ keys }}</div>
                      <div style="width: 5px" />
                      <div :title="items" class="text08rem text_c7 weight300 text_ellipsis">
                        {{ keys !== "count" ? items.toFixed(3) : items }}
                      </div>
                    </div>
                  </div>
                  <div style="width: 33%" />
                  <div style="width: 33%" />
                  <div style="width: 33%" />
                  <div style="width: 33%" />
                </div>
              </el-col>
            </el-row>

            <histogram-chart ref="chart_1" :chart_id="'chart_' + key" :data_list="item.desc" :if_formatter="true" :if_processed="true" :if_title="false" bottom_px="50px" chart_height="75%" height="300px" top_px="40px" width="100%" />
          </div>
          <div v-for="(item, key) in chartF" :key="key">
            <el-row style="margin: 0.5rem">
              <el-col :span="6">
                <div class="flex_def flex_start" style="height: 100%">
                  <span :title="key" class="text13rem text_c5 weight500 text_ellipsis" style="margin-left: 1rem">
                    {{ key }}
                  </span>
                </div>
              </el-col>
            </el-row>
            <barChart ref="chart_F" :chart_id="'chart_' + key" :data_list="[item.plot_info]" :if_title="false" :tooltip="false" height="300px" num="2" width="100%" y_name="" />
          </div>
          <div style="width: 60%; margin: 0 auto">
            <p>Select to Show More Charts</p>
            <div style="display: flex">
              <el-select v-model="more_charts" collapse-tags collapse-tags-tooltip multiple placeholder="Select">
                <el-option v-for="item in arr_unsame(tableLabels, newLabels)" :key="item.new_name" :label="item.new_name" :value="item.new_name" />
              </el-select>
              <el-button type="primary" @click="get_charts">{{ t("task.确认") }}</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-drawer v-model="drawer_data" :with-header="false">
      <div style="padding: 0 10px">
        <flexDiv class="flex_between">
          <p class="text13rem text_c2 weight600" style="margin: 0; line-height: 32px">
            {{ t("result.SelectDisplayP") }}
          </p>

          <el-button circle plain size="small" style="margin-bottom: 5px" type="danger" @click="drawer_data = false">
            <el-icon>
              <close />
            </el-icon>
          </el-button>
        </flexDiv>
        <hr style="margin: 0.25rem 0 1rem 0" />

        <div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem">
          <el-button plain size="small" style="width: 50%" type="primary" @click="toggle_all_props">
            <span class="">{{ t("result.SelectALL") }}</span>
          </el-button>
          <el-button plain size="small" style="width: 50%" type="primary" @click="toggle_none_props">
            <span class="">{{ t("result.SelectNone") }}</span>
          </el-button>
        </div>
        <el-checkbox-group v-model="left_checklist">
          <div style="display: flex; flex-wrap: wrap">
            <flexDiv v-for="item in tableLabels" :key="item.new_name" class="flex_between" style="width: 33%">
              <el-checkbox :label="item.dataset_col_id">{{ t(item.new_name) }}</el-checkbox>
              <el-tooltip :content="t(item.new_name)" class="box-item" effect="dark" placement="right" popper-class="popper" />
            </flexDiv>
          </div>
        </el-checkbox-group>
        <br />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getCurrentInstance, ref, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
import HistogramChart from "@drugflow/components/charts/histogram.vue";
import creation_task from "@drugflow/components/result_table/creation_task.vue";
// import lineChart from '@/components/charts/line.vue'
import barChart from "@drugflow/components/charts/bar.vue";
import svgBox from "@drugflow/common/svgBox.vue";
import { change_col_name, change_type, dataset_content, dataset_metainfo, plotinfo } from "@drugflow/api/qsar";
import { edit_table } from "@drugflow/api/table";
import { ElMessage } from "element-plus";
import { download_data } from "@drugflow/api/data";
// import Spinner from '@/components/common/spinner.vue'

export default {
  name: "qsarDetail",
  components: {
    HistogramChart,
    svgBox,
    // lineChart,
    barChart,
    // Spinner,
    creation_task
  },
  props: {
    isDialog: {
      type: Boolean,
      default: true
    },
    // tableData: {
    //   type: Array,
    //   default: function() {
    //     return []
    //   }
    // },
    chartData: {
      type: Object,
      default: function () {
        return {};
      }
    },
    // tableLabels: {
    //   type: Array,
    //   default: function() {
    //     return []
    //   }
    // },
    Smiles: {
      type: String,
      default: ""
    },
    dataset_id: {
      type: String
    },
    smiles_label: {
      type: Array
    },
    is_overview: {
      type: Boolean,
      default: false
    },
    new_task: {
      type: Boolean,
      default: false
    },
    is_download: {
      type: Boolean,
      default: false
    },
    is_edit: {
      type: Boolean,
      default: true
    }
  },
  setup(props, context) {
    const { t } = useI18n();
    const windowWidth = ref(window.innerWidth * 0.25 + "px");
    const activeName = ref("first");
    const tableData = ref();
    const tableLabels = ref([]);
    const left_checklist = ref([]);
    const newLabels = ref([]);
    const chartH = ref({});
    const chartF = ref({});
    const drawer_data = ref(false);
    const current_page = ref(1);
    const page_size = ref(50);
    const filtered_number = ref(0);
    const show2D = ref(false);
    const if_show = ref(false);
    // const dataType = ref('S')
    const svgSize = ref(160);
    const loading = ref(true);
    const old_label_name = ref("");
    // const smiles = toRefs(props).Smiles
    const smiles = ref(props.Smiles);
    const more_charts = ref();
    const oldValue = ref("");
    const check_all_list = ref([]);
    const checkAll = ref(false);
    const isIndeterminate = ref(false);
    const new_arr = ref();
    const data_name = ref(".sdf");
    const download_class = ref(0);

    const handleCheckAllChange = checked => {
      console.log(checked.value);
      if (checked.value) {
        new_arr.value = smiles_id_selection.value;
        smiles_id_selection.value = [...new_arr.value, ...check_all_list.value];
      } else {
        smiles_id_selection.value = [];
      }
      // smiles_id_selection.value = checked.value ? check_all_list.value : []
      isIndeterminate.value = false;
    };

    Object.keys(props.chartData).forEach(key => {
      // console.log(props.chartData)
      newLabels.value.push(key);
      if (props.chartData[key]?.desc?.amount) {
        chartH.value[key] = props.chartData[key];
      } else {
        chartF.value[key] = props.chartData[key];
        chartF.value[key].plot_info.product = key;
      }
    });
    const edit = ref({});
    const { proxy } = getCurrentInstance();
    const update_data = () => {
      // proxy.$refs.spinner_ref.show()
      loading.value = true;
      dataset_content(props.dataset_id, current_page.value, page_size.value, order.value).then(res => {
        // console.log(res)
        tableData.value = res.data.results;
        check_all_list.value = [];
        for (let i = 0; i < tableData.value.length; i++) {
          check_all_list.value.push(tableData.value[i].id);
        }
        loading.value = false;
        filtered_number.value = res.data.count;
        // proxy.$refs.spinner_ref.hide()
        // uploadData.value.data = res.data.results
      });
    };
    const order = ref("");
    const smiles_label = toRefs(props).smiles_label;
    // const smiles_label = ref()
    const sortChangeEvent = ({ sortList }) => {
      order.value = "";
      sortList.map(item => {
        order.value += "&order=" + [item.order === "asc" ? "" : "-"] + item.field;
        return order;
      });
      update_data();
    };
    const insertEvent = () => {};
    const deleteSelectEvent = () => {};
    const handleCommand = command => {
      // console.log(command)
      change_type({
        dataset_col_id: command.command,
        new_type: command.name
      }).then(res => {
        dataset_metainfo(props.dataset_id).then(res => {
          tableLabels.value = res.metainfo;
          if (res.extras_info.col_filters) {
            if (JSON.parse(res.extras_info.col_filters).length) {
              // this.left_checklist.push(res.data.extras_info.smiles_like[0])
              //   this.tableLabels = res.data.metainfo
              for (let j = 0; j < JSON.parse(res.extras_info.col_filters).length; j++) {
                for (let i = 0; i < res.metainfo.length; i++) {
                  if ("values_" + JSON.parse(res.extras_info.col_filters)[j] === res.metainfo[i].raw_name) {
                    left_checklist.value.push(res.metainfo[i].dataset_col_id);
                  }
                }
              }
            } else {
              for (let i = 0; i < res.metainfo.length; i++) {
                if (res.metainfo[i].raw_name !== "cs-smiles") {
                  left_checklist.value.push(res.metainfo[i].dataset_col_id);
                }
              }
            }
          } else {
            for (let i = 0; i < res.data.metainfo.length; i++) {
              if (res.metainfo[i].raw_name !== "cs-smiles") {
                left_checklist.value.push(res.metainfo[i].dataset_col_id);
              }
            }
          }
        });
      });
      // dataType.value = command.name
    };
    const beforeHandleCommand = (command, name) => {
      return {
        command,
        name
      };
    };
    const resize = ({ $rowIndex, column, columnIndex, $columnIndex, $event }) => {
      // console.log(columnIndex)
      // console.log(column.renderWidth)
      if (columnIndex === 1) {
        svgSize.value = column.renderWidth - 40;
      }
    };
    const show_2D = () => {
      if (smiles.value !== "") {
        svgSize.value = 160;
        show2D.value = !show2D.value;
      } else {
        if (props.Smiles === "" || props.Smiles === undefined) {
          proxy.$refs.select.toggleMenu();
        } else {
          smiles.value = props.Smiles;
          show2D.value = true;
        }
        // if_show.value = true
      }
    };
    const get_charts = () => {
      // console.log(more_charts.value)
      plotinfo({
        dataset_id: props.dataset_id,
        cols: more_charts.value
      }).then(res => {
        more_charts.value = [];
        Object.keys(res.data.plots_info).forEach(key => {
          newLabels.value.push(key);
          if (res.data.plots_info[key]?.desc?.amount) {
            chartH.value[key] = res.data.plots_info[key];
          } else {
            chartF.value[key] = res.data.plots_info[key];
            chartF.value[key].plot_info.product = key;
          }
        });
      });
    };
    const smiles_id_selection = ref([]);
    const arr_unsame = (arr1, arr2) => {
      const arr = arr1.filter(x => !arr2.some(y => y === x.new_name));
      return arr;
    };
    const is_dialog = ref(false);
    watch(left_checklist, () => {
      if (left_checklist.value.length < tableLabels.value.length) {
        is_dialog.value = true;
      } else {
        is_dialog.value = false;
      }
    });

    return {
      t,
      context,
      activeName,
      tableData,
      tableLabels,
      windowWidth,
      chartH,
      chartF,
      drawer_data,
      // editClosedEvent,
      newLabels,
      edit,
      sortChangeEvent,
      left_checklist,
      current_page,
      page_size,
      filtered_number,
      show2D,
      insertEvent,
      deleteSelectEvent,
      // dataType,
      handleCommand,
      beforeHandleCommand,
      resize,
      svgSize,
      update_data,
      loading,
      order,
      old_label_name,
      if_show,
      show_2D,
      smiles,
      // result_2D,
      more_charts,
      get_charts,
      proxy,
      arr_unsame,
      oldValue,
      smiles_label,
      smiles_id_selection,
      check_all_list,
      checkAll,
      isIndeterminate,
      handleCheckAllChange,
      data_name,
      download_class,
      is_dialog
    };
  },
  watch: {
    dataset_id(newVal) {
      this.smiles = "";
      this.tableLabels = [];
      this.left_checklist = [];
      this.show2D = false;
      if (newVal == "") return;
      dataset_metainfo(newVal).then(res => {
        this.data_name = res.data.name;
        for (let i = 0; i < res.data.metainfo.length; i++) {
          if (res.data.name.split(".").pop() === "sdf") {
            this.show2D = true;
            if (res.data.metainfo[i].raw_name !== "cs-smiles") {
              this.tableLabels.push(res.data.metainfo[i]);
              this.left_checklist.push(res.data.metainfo[i].dataset_col_id);
            }
          } else {
            this.tableLabels.push(res.data.metainfo[i]);
            this.left_checklist.push(res.data.metainfo[i].dataset_col_id);
          }
        }
      });
      dataset_content(newVal).then(res => {
        // console.log(res)
        this.tableData = res.data.results;
        this.check_all_list = [];
        for (let i = 0; i < this.tableData.length; i++) {
          this.check_all_list.push(this.tableData[i].id);
        }
        this.filtered_number = res.data.count;
        this.loading = false;
        // this.proxy.$refs.spinner_ref.hide()
        // uploadData.value.data = res.data.results
      });
    }
  },
  mounted() {
    dataset_metainfo(this.dataset_id).then(res => {
      this.data_name = res.name;
      if (res.name.split(".").pop() === "sdf") {
        if (!this.smiles) {
          this.smiles = res.extras_info.smiles_like[0];
        }
        this.show2D = true;
      } else {
        if (this.smiles) {
          this.show2D = false;
        }
      }
      for (let i = 0; i < res.metainfo.length; i++) {
        if (res.name.split(".").pop() === "sdf") {
          if (res.metainfo[i].raw_name !== "cs-smiles") {
            this.tableLabels.push(res.metainfo[i]);
            this.left_checklist.push(res.metainfo[i].dataset_col_id);
          }
        } else {
          this.tableLabels.push(res.metainfo[i]);
          this.left_checklist.push(res.metainfo[i].dataset_col_id);
        }
      }
    });
    dataset_content(this.dataset_id).then(res => {
      // console.log(res)
      this.tableData = res.results;
      this.check_all_list = [];
      for (let i = 0; i < this.tableData.length; i++) {
        this.check_all_list.push(this.tableData[i].id);
      }
      this.filtered_number = res.count;
      this.loading = false;
      // this.proxy.$refs.spinner_ref.hide()
      // uploadData.value.data = res.data.results
    });
  },
  methods: {
    close_message_box() {
      this.if_show = false;
    },
    download() {
      const check_list = [];
      if (this.download_class === 0) {
        this.tableLabels.filter(item1 => {
          return this.left_checklist.some(item2 => {
            if (item2 === item1.dataset_col_id) {
              if (item1.raw_name === "cs-smiles" && this.data_name.split(".").pop() === "sdf") {
              } else {
                check_list.push(item1.raw_name);
              }
            }
          });
        });
      }
      this.if_show = false;
      download_data({
        dataset_id: this.dataset_id,
        type: this.data_name.split(".").pop() === "pdb" ? "pdb" : "mol",
        ftype: this.data_name.split(".").pop(),
        extras: JSON.stringify({
          cols: check_list
        })
      }).then(res => {
        const blob = new Blob([res.data]);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = this.data_name;
        document.body.appendChild(link);
        link.click();
      });
    },
    open(dataset_col_id, index) {
      const input_name = "TagInput_" + dataset_col_id + index;
      // this.edit[dataset_col_id] = true
      this.tableLabels[index].edit = true;
      this.old_label_name = this.tableLabels[index].new_name;
      this.$nextTick(() => {
        this.$refs[input_name][0].focus();
      });
    },
    change_labels_name(dataset_col_id, index) {
      if (this.tableLabels[index].new_name !== this.old_label_name) {
        change_col_name({
          dataset_id: this.dataset_id,
          dataset_col_id,
          new_name: this.tableLabels[index].new_name
        })
          .then(res => {
            res.data.extras_info.smiles_like.map(val => {
              res.data.metainfo.map(vals => {
                if (val === vals.raw_name) {
                  this.smiles_label.push(vals);
                }
              });
            });
            if (this.tableLabels[index].new_name != this.smiles && res.data.extras_info.smiles_like.includes(this.tableLabels[index].raw_name)) {
              this.smiles = this.tableLabels[index].new_name;
            }
            this.update_data();
            this.$emit("changeListName", res.data.dataset_id);
          })
          .catch(res => {
            this.tableLabels[index].new_name = this.old_label_name;
            ElMessage.error(res.response.data.detail);
          });
      }
      this.tableLabels[index].edit = false;
    },
    arr_same(arr1, arr2) {
      const arr = [];
      for (let i = 0; i < arr1.length; i++) {
        for (let j = 0; j < arr2.length; j++) {
          if (arr1[i].dataset_col_id === arr2[j]) {
            arr.push(arr1[i]);
            break;
          }
        }
      }
      // console.log(arr)
      return arr;
    },
    toggle_all_props() {
      this.left_checklist = [];
      for (let i = 0; i < this.tableLabels.length; i++) {
        this.left_checklist.push(this.tableLabels[i].dataset_col_id);
      }
    },
    toggle_none_props() {
      this.left_checklist = [];
    },
    // update_data() {
    //   dataset_content(
    //     this.dataset_id,
    //     this.current_page,
    //     this.page_size,
    //     this.order
    //   )
    //     .then(res => {
    //       console.log(res)
    //       this.tableData = res.data.results
    //       // uploadData.value.data = res.data.results
    //     })
    // },
    page_size_change(val) {
      this.page_size = val;
      this.update_data();
    },
    current_page_change(val) {
      this.current_page = val;
      this.update_data();
      this.checkAll = false;
    },
    editActived({ row, column }) {
      this.oldValue = row.dynamic[column.title];
    },
    editClosedEvent({ row, column }) {
      // const oldValue = this.tableData[column.field.split('_')[1]].dynamic[column.title]
      // console.log(oldValue)
      // console.log(row)
      // console.log(column)
      // console.log(row.dynamic[column.title])
      // const $table = this.$refs.xTable
      // const field = column.field
      // const cellValue = row.dynamic[field]
      // console.log($table.isUpdateByRow(row, field))
      let dtype = "";
      for (let i = 0; i < this.tableLabels.length; i++) {
        // console.log(column.title)
        // console.log(this.tableLabels[i])
        if (this.tableLabels[i].new_name === column.title) {
          dtype = this.tableLabels[i].dtype;
        }
      }
      // 判断单元格值是否被修改
      if (this.oldValue !== row.dynamic[column.title]) {
        edit_table({
          data_id: row.data_id,
          col_name: column.field,
          dtype,
          old_val: this.oldValue,
          new_val: row.dynamic[column.title]
        })
          .then(res => {
            if (res.data.status === false) {
              ElMessage.error(res.data.reason);
              for (let i = 0; i < this.tableData.length; i++) {
                if (this.tableData[i].data_id === row.data_id) {
                  this.tableData[i].dynamic[column.title] = this.oldValue;
                }
              }
            }
          })
          .catch(res => {
            console.log(res);
          });
      }
      // if ($table.isUpdateByRow(row, field)) {
      //   setTimeout(() => {
      //     VXETable.modal.message({
      //       content: `保存成功！ ${field}=${cellValue}`,
      //       status: 'success',
      //     })
      //     // 局部更新单元格为已保存状态
      //     $table.reloadRow(row, null, field)
      //   }, 300)
      // }
    },
    clear() {
      this.$refs.xTable.clearSort();
      if (this.order !== "") {
        this.order = "";
        this.update_data();
      }
    }
  }
};
</script>

<style lang="css" scoped>
.mytable-scrollbar ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

/*滚动条的轨道*/
.mytable-scrollbar ::-webkit-scrollbar-track {
  background-color: #ffffff;
}

/*滚动条里面的小方块，能向上向下移动*/
.mytable-scrollbar ::-webkit-scrollbar-thumb {
  /*background-color: #bfbfbf;*/
  border-radius: 5px;
  border: 1px solid #f1f1f1;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

/*.mytable-scrollbar ::-webkit-scrollbar-thumb:hover {*/
/*  background-color: #A8A8A8;*/
/*}*/
/*.mytable-scrollbar ::-webkit-scrollbar-thumb:active {*/
/*  background-color: #909399;*/
/*}*/
/*边角，即两个滚动条的交汇处*/
.mytable-scrollbar ::-webkit-scrollbar-corner {
  background-color: #ffffff;
}
.inner_tabs > :deep(.el-tabs__content) {
  height: calc(100% - 55px);
}

.messbox_frame {
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
  width: 500px;
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
}

.show {
  opacity: 1;
  z-index: 1000;
}

.hint {
  font-size: 0.8rem;
  color: #777;
  margin: 1rem 0;
}

:deep(.vxe-table--render-default .vxe-cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.vxe-table--render-default .vxe-cell .vxe-cell--edit-icon) {
  display: none;
}

:deep(.vxe-table--render-default .vxe-body--column.col--ellipsis > .vxe-cell) {
  max-height: unset;
}

:deep(.vxe-table--render-default .vxe-header--column.col--ellipsis) {
  height: unset;
}

:deep(.vxe-table--render-default .vxe-body--column.col--ellipsis) {
  height: unset;
}

:deep(.vxe-table--render-default.vxe-editable .vxe-body--column) {
  height: unset;
}

:deep(.el-tabs__content) {
  position: unset;
}
</style>
