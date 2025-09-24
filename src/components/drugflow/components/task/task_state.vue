<template>
  <el-dropdown ref="dropdown" trigger="hover">
    <el-badge :value="running_task_count" :max="99" class="item">
      <el-button circle style="padding: 4px">
        <div class="task_spinner" :class="{ running: running_task_count > 0 }" />
      </el-button>
    </el-badge>

    <template #dropdown>
      <el-dropdown-menu>
        <div v-if="running_task_list.length > 0">
          <div v-for="item in running_task_list" :key="item.key" class="task_frame" :class="{ task_background: item.key % 2 == 0 }">
            <div class="task_card">
              <div class="flex_def flex_between">
                <div class="task_name" style="width: 8.57rem">
                  {{ item.name }}
                </div>
                <div v-if="item.type == 'molecular_factory'" class="flex_def task_state flex_start">
                  <div
                    style="width: 0.857rem; height: 0.857rem; border-radius: 50%; margin: 0 0.3rem 0 0"
                    class="state_warning"
                    :class="{
                      state_success: item.state == 'running'
                    }"
                  />
                  <span v-if="item.args.origin_args.need_docking">
                    {{ item.compute.progress_show > 80 ? t("task.对接中") : item.compute.progress_show > 50 ? t("task.生成中") : t("task.预处理") }}
                  </span>
                  <span v-else>
                    {{ item.compute.progress_show > 50 ? t("task.生成中") : t("task.预处理") }}
                  </span>
                </div>
                <div v-else class="flex_def task_state flex_start">
                  <div
                    style="width: 0.857rem; height: 0.857rem; border-radius: 50%; margin: 0 0.3rem 0 0"
                    class="state_warning"
                    :class="{
                      state_success: item.state == 'running'
                    }"
                  />
                  {{ t("task." + item.state) }}
                </div>

                <div class="flex_def">
                  <el-button size="small" :circle="true" disabled>
                    <el-icon color="red"><Delete /></el-icon>
                  </el-button>
                  <el-button v-if="false" size="small" circle>
                    <span style="color: #555">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                      </svg>
                    </span>
                  </el-button>
                  <el-button size="small" :disabled="item.compute.progress === 0" @click="goto_result_table(item.type, item.id)">
                    {{ t("task.详情") }}
                  </el-button>
                </div>
              </div>
              <div class="flex_def flex_start">
                <el-tag size="small" type="info">{{ algo_type_change(item) }}</el-tag>
                <div class="progress_main" style="margin: 0 1rem">
                  <el-progress :percentage="(item.compute.progress / item.compute.total) * 100">
                    <div class="progress_format" text>
                      <div v-if="item.compute.progress > -1">
                        {{ item.compute.progress }} /
                        {{ item.compute.total }}
                      </div>
                    </div>
                  </el-progress>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="task_suggest">{{ t("task.暂无正在运行的任务") }}</div>
        </div>
        <hr style="margin: 0.714rem 0" />
        <div class="flex_def flex_end" style="padding: 0 0.6rem">
          <div class="text_c7" style="margin-right: 0.6rem; font-size: 12px">{{ t("task.如需查看更多任务结果") }}，{{ t("task.前往") }}</div>
          <el-button type="primary" size="small" @click="router_push({ name: 'dashboard' })">{{ t("task.任务中心") }}</el-button>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import { useI18n } from "vue-i18n";
import { h, inject, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { screen_get } from "@drugflow/api/screen.js";
import { algo_type_change, router_dict } from "@drugflow/utils/common";

export default {
  name: "task_state",
  components: {},
  props: {
    space_id: { type: Number },
    task_type: { type: String, default: "all" }
  },
  setup(props) {
    const { t } = useI18n();
    const router = useRouter();
    const router_push = command => {
      router.push(command);
    };
    const onmessage = e => {
      const edata = JSON.parse(e.data);
      update_task_list();
      if (edata.object.state === "finished" && edata.object.type !== "qsar-temp") {
        ElNotification({
          title: t("task.有新的任务完成"),
          message: h(
            "div",
            {
              style: "width: 250px;"
            },
            [
              h(
                "p",
                null,
                edata.object.name + t("task.运行结束")
                // + edata.object.compute.progress +
                // ' / ' +
                // edata.object.compute.total +
                // t('task.计算分子数量')
              ),
              h(
                "button",
                {
                  class: "text09rem common_btn bg_primary hover_primary",
                  style: "padding: 0 1rem; line-height: 1.6rem; margin-top: 0.7rem",
                  onclick: () => {
                    goto_result_table(edata.object.type, edata.object.id);
                  }
                },
                t("task.详情")
              )
            ]
          ),
          type: "success",
          offset: 53,
          "on-click": () => {
            goto_result_table(edata.object.type, edata.object.id);
          }
        });
      } else if (edata.object.state === "aborted") {
        ElNotification({
          title: "任务失败!",
          message: h(
            "div",
            {
              style: "width: 250px;"
            },
            [
              h("p", null, edata.object.name + " 运行失败，请检查"),
              h(
                "button",
                {
                  class: "text09rem common_btn border_danger color_danger hover_danger",
                  style: "padding: 0 1rem; line-height: 1.6rem; margin-top: 0.7rem",
                  onclick: () => {
                    show_err(edata);
                  }
                },
                "查看错误"
              )
            ]
          ),
          type: "error",
          offset: 53
        });
      }
    };

    const websocket = inject("websocket");

    const running_task_list = ref([]);
    const running_task_count = ref(0);
    const update_task_list = () => {
      // console.log(props.space_id, props.task_type)
      return screen_get(props.space_id, props.task_type, "running", 1, 7).then(res => {
        running_task_list.value = reactive(res.results);
        running_task_count.value = res.count;
      });
    };
    update_task_list();

    const goto_result_table = function (algo_type, id) {
      router.push({ name: router_dict[algo_type], params: { task_id: id }, query: { ws_id: props.space_id } });
    };

    const dropdown = ref(null);
    const show_err = edata => {
      ElMessageBox.alert(edata.object.compute.abort_reason, "错误信息", {
        confirmButtonText: "OK",
        type: "error"
      });
    };
    watch(
      () => props.space_id,
      () => {
        update_task_list();
      }
    );

    return {
      t,
      router_push,
      running_task_list,
      running_task_count,
      dropdown,
      goto_result_table,
      websocket,
      onmessage,
      algo_type_change,
      update_task_list
    };
  },
  mounted() {
    this.websocket.setFunc("task_state", this.onmessage);
  },
  unmounted() {
    this.websocket.setFunc("task_state", undefined);
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.task_frame {
  width: 27.14rem;
  margin: 0 0.71rem;
}
.task_card {
  padding: 0.5rem 0.71rem;
}
.task_name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}
.task_state {
  font-size: 12px;
  color: #999;
  width: 5.71rem;
}
.progress_format {
  font-size: 12px;
  color: #999;
}
.progress_main .el-progress--line {
  width: 12.5rem;
}
.task_title {
  font-size: 14px;
  margin-right: 0.5rem;
  font-weight: bold;
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
.state_success {
  background: #009237;
}
.state_danger {
  background: rgb(174, 22, 22);
}
.task_suggest {
  width: 100%;
  text-align: center;
  padding: 1rem;
  color: #777;
  font-size: 0.857rem;
}
.task_spinner {
  height: 24px;
  width: 24px;
  border: 6px solid #d1d5db;
  border-top-color: rgb(0, 180, 42);
  border-radius: 50%;
}
.running {
  animation: spinner 1500ms linear infinite;
}

@keyframes spinner {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<style lang="scss"></style>
