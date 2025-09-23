<template>
  <div>
    <div class="left_main_bar">
      <div class="flex_def cursor_hover" style="margin: 1rem 0 3rem 0" @click="push_index">
        <img :src="requireImg('favicon_white.png')" alt="favicon" class="left_nav_title_img" />
      </div>
      <el-popover placement="right-start" trigger="hover" width="220px">
        <template #reference>
          <div class="flex_def left_main_icon" :class="{ left_icon_now: left_main_item_now === 'Workspace' }" @click="router_push({ name: 'workspace' })">
            <svg_temp name="home" width="20px" height="20px" :color="icon_color" />
          </div>
        </template>
        <el-button text plain class="text_cb weight300" style="width: 100%; justify-content: start; margin: 0" @click="router_push({ name: 'workspace' })">
          {{ t("message.我的工作台") }}
        </el-button>
      </el-popover>

      <el-popover v-for="item in menu_list" :key="item" placement="right-start" trigger="hover" popper-style="width: min-content;min-width: 220px">
        <template #reference>
          <div class="flex_def left_main_icon" :class="{ left_icon_now: left_main_item_now === item.tab }">
            <filter_svg v-if="item.tab == 'Main Module'" :width="icon_width" :height="icon_height" :color="icon_color" />
            <forecast_svg v-if="item.tab == 'Druggability'" :color="icon_color" :height="icon_height" :width="icon_width" />
            <modeler_svg v-if="item.tab == 'Inno Modeler'" :color="icon_color" :height="icon_height" :width="icon_width" />
            <pipeline_svg v-if="item.tab == 'Denove'" :color="icon_color" :height="icon_height" :width="icon_width" />
            <tools_svg v-if="item.tab == 'Tools'" :width="icon_width" :height="icon_height" :color="icon_color" />
          </div>
        </template>
        <p style="margin: 0; font-weight: 300" class="text_cb">
          {{ t(item.title) }}
        </p>
        <el-divider style="margin: 0.5rem 0" />

        <el-button v-for="val in item.children" text plain style="width: 100%; justify-content: start; margin: 0; overflow: hidden" :disabled="val.disabled" @click="router_push({ name: val.link, query: { tab: 'submit_task' } })">
          {{ t(val.label) }}
        </el-button>
      </el-popover>

      <div class="left_bottom">
        <el-popover placement="right-start" trigger="hover" width="220px">
          <template #reference>
            <div class="flex_def left_main_icon" :class="{ left_icon_now: left_main_item_now === 'Task' }" @click="router_push({ name: 'dashboard' })">
              <task_svg :width="icon_width" :height="icon_height" :color="icon_color" />
            </div>
          </template>
          <el-button text plain class="text_cb weight300" style="width: 100%; justify-content: start; margin: 0" @click="router_push({ name: 'dashboard' })">
            {{ t("message.TaskCenter") }}
          </el-button>
        </el-popover>

        <el-popover placement="right-start" trigger="hover" width="220px">
          <template #reference>
            <div class="flex_def left_main_icon" :class="{ left_icon_now: left_main_item_now === 'Data' }" @click="router_push({ name: 'data_center' })">
              <data_svg :width="icon_width" :height="icon_height" :color="icon_color" />
            </div>
          </template>
          <el-button text plain class="text_cb weight300" style="width: 100%; justify-content: start; margin: 0" @click="router_push({ name: 'data_center' })">
            {{ t("index.data_center") }}
          </el-button>
        </el-popover>

        <el-popover placement="right-start" trigger="hover" width="220px">
          <template #reference>
            <div class="flex_def left_main_icon" :class="{ left_icon_now: left_main_item_now === 'Manager' }">
              <svg_temp name="avatar" width="32px" height="32px" />
            </div>
          </template>
          <p style="margin: 0; font-weight: 300" class="text_cb">
            {{ t("index.用户管理") }}
          </p>
          <el-divider style="margin: 0.5rem 0" />
          <el-button v-if="is_staff" text plain style="width: 100%; justify-content: start; margin: 0" @click="router_push({ name: 'setting', query: { tab: 'api' } })">
            {{ t("index.APP管理") }}
          </el-button>
          <el-button v-if="is_staff" text plain style="width: 100%; justify-content: start; margin: 0" @click="router_push({ name: 'manage_center' })">
            {{ t("task.管理中心") }}
          </el-button>
          <el-button text plain style="width: 100%; justify-content: start; margin: 0" @click="router_push({ name: 'personal_center' })">
            {{ t("index.个人中心") }}
          </el-button>
          <el-button text plain style="width: 100%; justify-content: start; margin: 0" @click="signout">
            {{ t("message.Logout") }}
          </el-button>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import svg_temp from "@drugflow/components/icon/svg_temp.vue";
import pipeline_svg from "@drugflow/components/icon/pipeline_svg.vue";
import modeler_svg from "@drugflow/components/icon/modeler_svg.vue";
import tools_svg from "@drugflow/components/icon/tools_svg.vue";
import task_svg from "@drugflow/components/icon/task_svg.vue";
import data_svg from "@drugflow/components/icon/data_svg.vue";
import filter_svg from "@drugflow/components/icon/filter_svg.vue";
import { signout_api } from "@drugflow/api/user";
// import { ElMessage } from 'element-plus'
import Forecast_svg from "@drugflow/components/icon/forecast_svg.vue";
import { ment_dictionary, menu } from "@drugflow/utils/common";
import { requireImg } from "@drugflow/common/utils.js";

export default {
  name: "app_multi_leftbar",
  components: { Forecast_svg, svg_temp, pipeline_svg, tools_svg, task_svg, modeler_svg, filter_svg, data_svg },
  props: {
    if_left_narrow: {
      type: Boolean,
      default: false
    },
    left_main_item_now: {
      type: String,
      default: "Main Module"
    },
    left_sub_item_now: {
      type: String,
      default: "ADMET"
    },
    api_permission: {
      type: Boolean,
      default: true
    },
    is_staff: {
      type: Boolean,
      default: true
    },
    uname: {
      type: String,
      default: "uname"
    },
    uemail: {
      type: String,
      default: "uemail"
    },
    privatization: {
      type: null,
      required: true
    }
  },
  setup(props, context) {
    const { t } = useI18n();
    const router = useRouter();
    const router_push = command => {
      router.push(command);
    };
    const icon_width = ref("18px");
    const icon_height = ref("18px");
    const icon_color = ref("#eee");
    const main_collapse = ref(["1", "2", "3", "4"]);
    const tools_collapse = ref(["1"]);
    const pipeline_collapse = ref(["1"]);
    const setting_collapse = ref(["1", "2"]);
    const menu_list = ref();
    return {
      t,
      router_push,
      icon_width,
      icon_height,
      icon_color,
      main_collapse,
      tools_collapse,
      pipeline_collapse,
      setting_collapse,
      context,
      menu_list,
      requireImg
    };
  },
  watch: {
    privatization: {
      handler(newValue, oldValue) {
        // console.log('privatization prop changed:', newValue);
        // console.log(menu)
        // console.log(this.privatization)
        if (this.privatization) {
          const new_arr = this.privatization.map(item => ment_dictionary[item]);
          console.log(new_arr);
          this.menu_list = menu;
          this.menu_list.forEach(category => {
            category.children.forEach(child => {
              if (new_arr.includes(child.link)) {
                child.disabled = false;
              } else {
                child.disabled = true;
              }
            });
          });
        } else {
          this.menu_list = menu;
        }
      }
    }
  },
  mounted() {},
  methods: {
    change_left_main_item_now(val) {
      this.context.emit("update:left_main_item_now", val);
    },
    close_open_left() {
      this.context.emit("close_open_left");
    },
    signout() {
      ElMessage({
        message: this.t("message.正在处理"),
        type: "success"
      });
      signout_api()
        .then(res => {
          ElMessage({
            message: this.t("message.登出成功"),
            type: "success"
          });
          sessionStorage.removeItem("privatization");
          sessionStorage.removeItem("isvisited");
          localStorage.removeItem("cs_is_staff");
          localStorage.removeItem("cs_user_info");
          localStorage.setItem("cs_signined", "false");
          this.router_push({ name: "signin" });
        })
        .catch(() => {
          ElMessage.error(this.t("message.登出失败"));
        });
    },
    push_index() {
      this.router_push({ name: "index" });
    }
  }
};
</script>

<style lang="css" scoped>
.weight300 {
  font-weight: 300;
}

.left_nav_title_img {
  height: 1.6rem;
}

.left_main_icon {
  margin: 1rem auto;
  width: 35px;
  height: 35px;
  border-radius: 50%;
}

.left_icon_now {
  background: #3c63d4;
  color: #fff;
  cursor: pointer;
}

.left_main_icon:hover {
  background: #3c63d4;
  color: #fff;
  cursor: pointer;
}

.no_hover:hover {
  background: inherit;
  color: inherit;
  cursor: unset;
}

.cursor_hover:hover {
  cursor: pointer;
}

.leftbar_btn {
  position: absolute;
  transition: left 0.3s;
  top: 1rem;
  left: 14.2rem;
  z-index: 999;
}

.leftbar_btn_change {
  left: 2.3rem;
}

.text_cb {
  font-size: 14px;
  color: #0040d6;
}

.left_main_bar {
  height: 100vh;
  width: 3rem;
  background-color: #0040d6;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 998;
}

.left_sub_bar {
  height: 100vh;
  width: 12rem;
  background-color: #0036b3;
  position: absolute;
  left: 3rem;
  top: 0;
  padding: 0 0.8rem;
  border-right: 1px solid #eee;
  transition: left 0.3s;
}

.left_sub_item {
  padding: 0.35rem 0.75rem;
  margin: 0 0;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
  font-weight: 300;
}

.left_sub_item:hover {
  background-color: #0040d6;
  color: #eee;
  cursor: pointer;
}

.left_sub_item_disable:hover {
  cursor: not-allowed;
}

.left_sub_now {
  background-color: #0040d6;
  color: #eee;
  cursor: pointer;
}

.left_sub_bar_change {
  left: -9rem;
}

.left_bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  left: 0;
}

.avatar_span {
  color: #f2f2f2;
  text-overflow: ellipsis;
  width: 100px;
  overflow: hidden;
}

:deep(.el-collapse-item__wrap) {
  background-color: transparent;
}

:deep(.el-collapse-item__header) {
  background-color: transparent;
  height: 2rem;
  font-weight: 300;
  font-size: 12px;
  color: #ccc;
}

.el-button.is-text {
  padding-left: 0.75rem;
}
</style>
