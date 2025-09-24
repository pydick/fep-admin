<template>
  <el-card shadow="never">
    <el-table :data="running_task_list" style="width: 100%; min-height: 15rem" stripe cell-class-name="pc_padding_cell">
      <template #empty>
        <el-skeleton v-if="responsed" :rows="3" animated />
        <p v-else class="text_c7 text1rem text_center" style="line-height: 10rem">
          {{ t("task.前往") }}
          <a class="mya hover_green" @click="change_tab">{{ t("task.任务创建页面") }}</a>
          {{ t("task.下发您的第一个任务") }}
        </p>
      </template>

      <el-table-column type="selection" width="40" />

      <el-table-column :label="t('task.任务名称')" min-width="150" align="left">
        <template v-slot="{ row }">
          <div>
            <div class="task_name">
              <name_changer :space_id="space_id" :old_task_name="row.name" :task_id="row.id" :state="row.state" />
            </div>
            <div class="flex_def flex_start">
              <div style="font-size: 10px; color: #999; margin-left: 8px">
                <span>{{ time_format(row.created_at) }}</span>
                <span v-if="row.compute.finished_time">/</span>
                <span v-if="row.compute.finished_time">{{ time_format(row.compute.finished_time) }}</span>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="t('task.任务类别')" align="center">
        <template v-slot="{ row }">
          <el-tag type="info" class="task_tag" size="normal">{{ algo_type_change(row) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="t('task.运行状态')" min-width="100" align="center">
        <template v-slot="{ row }">
          <div v-if="['finished', 'aborted'].indexOf(row.state) !== -1" class="flex_def flex_column" style="align-items: center">
            <div class="flex_def task_state flex_start">
              <div
                style="width: 12px; height: 12px; border-radius: 50%; margin: 0 4px 0 0"
                class="state_danger"
                :class="{
                  state_success: row.state == 'finished'
                }"
              />
              {{ t("task." + row.state) }}
            </div>
            <div v-if="row.state == 'finished'" class="progress_format" style="margin: 0 1rem" />
            <div v-if="row.state !== 'finished'" class="progress_format" style="margin: 0 1rem">
              {{ t("task.存在错误") }}
            </div>
          </div>
          <div v-else class="flex_def flex_column" style="align-items: center">
            <div v-if="row.type == 'molecular_factory'" class="flex_def task_state flex_start">
              <div
                style="width: 12px; height: 12px; border-radius: 50%; margin: 0 4px 0 0"
                class="state_warning"
                :class="{
                  state_success: row.state == 'running'
                }"
              />
              <span v-if="row.args.origin_args.need_docking">
                {{ row.compute.progress_show > 80 ? t("task.对接中") : row.compute.progress_show > 50 ? t("task.生成中") : row.compute.progress_show > 0 ? t("task.预处理") : t("task." + row.state) }}
              </span>
              <span v-else>
                {{ row.compute.progress_show > 0 ? t("task.生成中") : t("task." + row.state) }}
              </span>
            </div>
            <div v-else class="flex_def task_state flex_start">
              <div
                style="width: 12px; height: 12px; border-radius: 50%; margin: 0 4px 0 0"
                class="state_warning"
                :class="{
                  state_success: row.state == 'running'
                }"
              />
              {{ t("task." + row.state) }}
            </div>
            <div class="progress_main" style="margin: 0.5rem 1rem">
              <el-progress :show-text="false" :percentage="row.compute.progress_show ? row.compute.progress_show : (row.compute.progress / row.compute.total) * 100">
                <div class="progress_format" text>
                  <div v-if="row.compute?.progress > -1" />
                </div>
              </el-progress>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column v-if="privatization === 'null'" :label="t('manage.实际计算费用')" align="center">
        <template v-slot="{ row }">
          <div>{{ row.tokens }} token</div>
        </template>
      </el-table-column>

      <el-table-column :label="t('task.操作')" width="200" align="center">
        <template v-slot="{ row }">
          <div class="flex_def">
            <el-tooltip v-if="row.type !== 'protein_process' && row.type !== 'cress' && row.type !== 'cmgnet' && row.type !== 'rescoring' && row.type !== 'qsar' && row.type !== 'qsar-test' && row.type !== 'img2mol'" :content="t('message.重新发起')" placement="bottom" effect="light">
              <el-button :disabled="new Date(row.created_at).getTime() < 1709884875674" link size="small" @click="refresh(row)">
                <el-icon :size="20" :color="new Date(row.created_at).getTime() < 1709884875674 ? '#d2d2d2' : '#333333'">
                  <RefreshRight />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip v-if="row.type !== 'cress' && row.type !== 'cmgnet' && row.type !== 'protein_process' && row.type !== 'qsar-test'" :content="t('result.参数详情')" placement="bottom" effect="light">
              <el-button link size="small" @click="params_detail(row.type, row.id)">
                <el-icon :size="20" color="#333333"><InfoFilled /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip v-if="['finished', 'aborted'].indexOf(row.state) !== -1" :content="t('message.删除')" placement="bottom" effect="light">
              <div>
                <el-popconfirm width="220" :confirm-button-text="t('result.确认')" :cancel-button-text="t('result.取消')" :icon="InfoFilled" :title="t('message.确认删除')" @confirm="delete_jobs(row.id)">
                  <template #reference>
                    <!--                  @click="delete_jobs('results', row.id)"-->
                    <el-button circle :disabled="['finished', 'aborted'].indexOf(row.state) == -1" size="small">
                      <el-icon :color="['finished', 'aborted'].indexOf(row.state) == -1 ? '#d2d2d2' : 'red'">
                        <Delete />
                      </el-icon>
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </el-tooltip>
            <el-tooltip v-else :content="t('message.中止')" placement="bottom" effect="light">
              <div>
                <el-popconfirm width="220" :confirm-button-text="t('result.确认')" :cancel-button-text="t('result.取消')" :icon="InfoFilled" :title="t('message.确认中止')" @confirm="stop_jobs(row.id)">
                  <template #reference>
                    <el-button size="small" :disabled="row.state === 'aborted' || row.state === 'finished'" link>
                      <el-icon :size="20"><VideoPause /></el-icon>
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </el-tooltip>
            <el-tooltip :content="t('message.错误详情')" placement="bottom" effect="light">
              <el-button link size="small" :disabled="row.state !== 'aborted'" @click="show_err(row.compute)">
                <el-icon :size="20" :color="row.state === 'aborted' ? 'red' : '#d2d2d2'">
                  <WarningFilled />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :content="t('message.结果详情')" placement="bottom" effect="light">
              <!--              :disabled="!row.compute.progress > 0 && row.state !== 'finished'"-->
              <el-button circle size="small" @click="goto_result_table(row.type, row.id)">
                <!--                :color="row.compute.progress > 0 || row.state === 'finished' ? '#2c2c2c' : '#d2d2d2'"-->
                <svg_temp name="details" width="16" height="16" />
              </el-button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="block">
      <el-pagination align="center" :current-page="current_page" :page-size="page_size" layout="total, prev, pager, next, jumper" :total="task_count" @current-change="handleCurrentChange" />
    </div>

    <Spinner ref="spinner_ref" />
    <custom_dialog :options="dialogOptions1">
      <template #dialogContent>
        <details_dialog v-if="dialogOptions1.visible" :options="dialogOptions1" />
      </template>
    </custom_dialog>
  </el-card>
</template>

<script>
import { useI18n } from "vue-i18n";
import { getCurrentInstance, h, inject, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { InfoFilled } from "@element-plus/icons-vue";
import { delete_jobs_api, get_job_id_api, start_jobs_api, stop_jobs_api } from "@drugflow/api/person_center.js";
import { time_format } from "@drugflow/common/utils";
import { screen_get } from "@drugflow/api/screen.js";
import Spinner from "@drugflow/common/spinner.vue";
import svg_temp from "@drugflow/components/icon/svg_temp.vue";
import { algo_type_change, err_code, refresh_dict, router_dict } from "@drugflow/utils/common";
import name_changer from "@drugflow/common/name_changer.vue";
import { table_getdata } from "@drugflow/api/table";
import { smiles_list } from "@drugflow/api/molecularFactory/result";
import { get_vs_data } from "@drugflow/api/virtual";
import custom_dialog from "@drugflow/components/dialog/custom_dialog.vue";
import details_dialog from "./details_dialog.vue";
import { pdb_datalists } from "@drugflow/api/data";
import { dataset_metainfo } from "@drugflow/api/qsar";

export default {
  name: "task_card",
  components: { Spinner, name_changer, svg_temp, custom_dialog, details_dialog },
  props: {
    space_id: { type: Number },
    task_type: { type: String, default: "all" },
    task_name: { type: String, default: "ADMET TASK" },
    ori_task_name: { type: String, default: "ADMET TASK" }
  },
  setup(props, context) {
    const { proxy } = getCurrentInstance();
    function change(type) {
      proxy.$i18n.locale = type;
    }
    const { t } = useI18n();
    const responsed = ref(true);
    const dialogOptions1 = ref({
      visible: false,
      top: "15vh",
      width: "550px",
      center: true,
      title: t("result.参数详情"),
      data: {}
    });
    const router = useRouter();
    const router_push = command => {
      router.push(command);
    };
    const current_page = ref(1);
    const task_count = ref(null);
    const page_size = ref(10);
    const running_task_list = ref([]);
    const user_type = ref(localStorage.getItem("user_type"));
    const privatization = ref(sessionStorage.getItem("privatization"));
    const update_task_list = () => {
      // props.space_id,
      screen_get(props.space_id, props.task_type, "all", current_page.value, page_size.value).then(res => {
        task_count.value = res.count;
        running_task_list.value = reactive(res.results);
        responsed.value = false;
      });
      get_job_id_api()
        .then(res => {
          context.emit("update:task_name", props.ori_task_name + " " + res.serial);
        })
        .catch(() => {
          ElMessage.error(t("message.修改失败检查网络"));
        });
    };
    if (props.task_type !== "none") {
      update_task_list();
    }

    const websocket = inject("websocket");

    const goto_result_table = function (algo_type, id) {
      if (algo_type === "molecular_factory") {
        const formData = new FormData();
        formData.append("page_size", 1);
        formData.append("order", "");
        formData.append("page", 1);
        formData.append(
          "values",
          JSON.stringify({
            list_type: "list",
            like_filter: ""
          })
        );
        formData.append("filter", JSON.stringify({}));
        smiles_list(id, formData).then(res => {
          if (res.data.results.length) {
            router.push({
              name: router_dict[algo_type],
              params: { task_id: id },
              query: { ws_id: props.space_id }
            });
          } else {
            ElMessageBox.alert(t("common_error.无数据"), "错误信息", {
              confirmButtonText: "OK",
              type: "error"
            });
          }
        });
      } else if (algo_type === "virtual_screening") {
        get_vs_data(id, this.space_id, 1, 1).then(res => {
          if (res.data.results.length) {
            router.push({ name: router_dict[algo_type], params: { task_id: id } });
          } else {
            ElMessageBox.alert(t("common_error.无数据"), "错误信息", {
              confirmButtonText: "OK",
              type: "error"
            });
          }
        });
      } else if (algo_type === "protein_process") {
        router.push({
          name: router_dict[algo_type],
          params: { task_id: id },
          query: { ws_id: props.space_id }
        });
      } else if (algo_type === "img2mol") {
        router.push({
          name: router_dict[algo_type],
          params: { task_id: id },
          query: { ws_id: props.space_id }
        });
      } else {
        table_getdata({ id, page_size: 1 }).then(res => {
          if (res.data.results.length) {
            router.push({
              name: router_dict[algo_type],
              params: { task_id: id },
              query: { ws_id: props.space_id }
            });
          } else {
            ElMessageBox.alert(t("common_error.无数据"), "错误信息", {
              confirmButtonText: "OK",
              type: "error"
            });
          }
        });
      }
    };
    watch(
      () => props.space_id,
      () => {
        update_task_list();
      }
    );

    return {
      t,
      InfoFilled,
      change,
      router_push,
      websocket,
      current_page,
      page_size,
      task_count,
      running_task_list,
      update_task_list,
      goto_result_table,
      time_format,
      context,
      responsed,
      algo_type_change,
      router,
      user_type,
      dialogOptions1,
      privatization
    };
  },
  mounted() {
    if (this.task_type !== "none") {
      this.websocket.setFunc("task_card", this.update_task_list);
    }
  },
  unmounted() {
    if (this.task_type !== "none") {
      this.websocket.setFunc("task_card", undefined);
    }
  },
  methods: {
    params_detail(type, id) {
      console.log(type, id);
      this.dialogOptions1.data.id = id;
      this.dialogOptions1.data.type = type;
      this.dialogOptions1.visible = true;
    },
    refresh(row) {
      let num = 0;
      if (row.args.pdb || row.args.mol) {
        if (row.args.pdb?.length) {
          for (let i = 0; i < row.args.pdb.length; i++) {
            pdb_datalists(row.args.pdb[i])
              .then(() => {
                num += 1;
                if (num >= row.args.pdb?.length ? row.args.pdb.length : 0 + row.args.mol?.length ? row.args.mol.length : 0) {
                  this.router.push({ name: refresh_dict[row.type], query: { task_id: row.id, tab: "submit_task" } });
                }
              })
              .catch(err => {
                console.log(err);
                ElMessageBox.alert(this.t("result.文件内容缺失"), "错误信息", {
                  confirmButtonText: "OK",
                  type: "error"
                });
              });
          }
        }
        if (row.args.mol?.length) {
          for (let i = 0; i < row.args.mol.length; i++) {
            dataset_metainfo(row.args.mol[i])
              .then(() => {
                num += 1;
                if (num >= row.args.pdb?.length ? row.args.pdb.length : 0 + row.args.mol?.length ? row.args.mol.length : 0) {
                  this.router.push({ name: refresh_dict[row.type], query: { task_id: row.id, tab: "submit_task" } });
                }
              })
              .catch(err => {
                console.log(err);
                ElMessageBox.alert(this.t("result.文件内容缺失"), "错误信息", {
                  confirmButtonText: "OK",
                  type: "error"
                });
              });
          }
        }
      } else {
        this.router.push({ name: refresh_dict[row.type], query: { task_id: row.id, tab: "submit_task" } });
      }
    },
    delete_jobs(id) {
      this.$refs.spinner_ref.show();
      delete_jobs_api(id, this.space_id)
        .then(() => {
          return this.update_task_list();
        })
        .then(() => {
          this.$refs.spinner_ref.hide();
        })
        .catch(() => {
          this.current_page -= 1;
          return this.update_task_list();
        })
        .then(() => {
          this.$refs.spinner_ref.hide();
        });
    },
    stop_jobs(id) {
      stop_jobs_api(id, this.space_id).then(() => {
        this.update_task_list();
      });
    },
    start_jobs(id) {
      start_jobs_api(id).then(() => {
        this.update_task_list();
      });
    },
    change_tab() {
      this.context.emit("goto_tab", "first");
    },
    show_err(compute) {
      if (compute.code || compute.reason || compute.abort_reason) {
        let type = this.$props.task_type;
        type = err_code(compute.code) ? err_code(compute.code) : this.$props.task_type;
        if (["admet-dl", "admet-fh", "admet-sa"].indexOf(this.$props.task_type) > -1) {
          type = "admet";
        } else if (["qsar", "qsar-test", "qsar&type=qsar-test"].indexOf(this.$props.task_type) > -1) {
          type = "qsar";
        } else if (["cmgnet", "cress"].indexOf(this.$props.task_type) > -1) {
          type = "spectum";
        }
        ElMessageBox({
          title: "错误信息",
          type: "error",
          message: h(
            "div",
            {
              style: "font-size: 14px; max-height: 8rem; overflow-y: auto; overflow-x: hidden; line-break: anywhere"
            },
            [
              h("p", { style: "font-weight: bold" }, this.t(type + "_error." + compute.code) === type + "_error." + compute.code ? "" : this.t(type + "_error." + compute.code) + `[${compute.code}]`),
              // h('span', null, this.t('task.错误详情')),
              h("span", { style: "" }, `[${compute.abort_reason ? compute.abort_reason : compute.reason}]`)
            ]
          )
        });
      } else {
        ElMessageBox.alert(this.t("common_error." + 100), "错误信息", {
          confirmButtonText: "OK",
          type: "error"
        });
      }
    },
    // show_err(compute) {
    //   if (compute.abort_reason) {
    //     ElMessageBox.alert(compute.abort_reason, '错误信息', {
    //       confirmButtonText: 'OK',
    //       type: 'error'
    //     })
    //   } else {
    //     ElMessageBox.alert(this.t('common_error.' + 100), '错误信息', {
    //       confirmButtonText: 'OK',
    //       type: 'error'
    //     })
    //   }
    // },
    handleCurrentChange(val) {
      this.current_page = val;
      this.update_task_list();
    }
  }
};
</script>

<style lang="css" scoped>
:deep(.el-card__body) {
  padding-top: 0.2rem;
}

.task_tag {
  margin-right: 0.5rem;
}

.filter_comp {
  margin-right: 10px;
}

.task_frame {
  margin: 0 10px;
}

.task_card {
  padding: 0.5rem 10px;
}

.task_name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.task_state {
  font-size: 12px;
  color: #999;
  /* width: 80px; */
}

.progress_format {
  font-size: 12px;
  color: #999;
}

.progress_main .el-progress--line {
  width: 200px;
}

.task_title {
  font-size: 14px;
  margin-right: 0.5rem;
}

.have_running_task {
  color: #009237;
}

.task_background {
  background: #fafafa;
}

.state_warning {
  background: #cb7c32;
}

.state_danger {
  background: rgb(174, 22, 22);
}

.state_success {
  background: #009237;
}

.task_suggest {
  width: 100%;
  text-align: center;
  padding: 1rem;
  color: #777;
  font-size: 14px;
}

.filter_select {
  width: 125px;
}
:deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>

<style lang="css">
.el-select .el-input .el-select__caret {
  color: #333;
}
</style>
