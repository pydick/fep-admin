<template>
  <div class="top_nav">
    <div class="content_1600 flex_def" style="height: 100%">
      <div class="flex_def flex_between" style="width: 100%">
        <div><slot name="title" /></div>
        <div class="flex_def flex_end" style="position: absolute; top: 12px; right: 12px; z-index: 999; background-color: rgb(255, 255, 255)">
          <el-button v-if="privatization === 'null'" @click="open_notice">
            <span class="text12rem text_c3" style="margin-right: 0.4rem">{{ t("index.意见反馈") }}</span>
            <el-icon size="17px" color="#606266"><Edit /></el-icon>
          </el-button>
          <el-button style="padding-left: 0.6rem; padding-right: 0.6rem; margin-right: 12px" @click="open_doc_url">
            <span class="text12rem text_c3" style="margin-right: 0.4rem">{{ t("index.文档") }}</span>
            <svg_temp name="link" width="14" height="14" />
          </el-button>
          <change_language style="margin-right: 12px" />
          <task_state :space_id="space_id" :task_type="task_type" style="margin-right: 12px" />
        </div>
      </div>
    </div>
    <custom_dialog :options="dialogOptions1">
      <template #dialogContent>
        <notice_dialog v-if="dialogOptions1.visible" :options="dialogOptions1" />
      </template>
    </custom_dialog>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { getCurrentInstance, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { signout_api } from "../../api/user";
import change_language from "@drugflow/common/change_language.vue";
import task_state from "@drugflow/components/task/task_state.vue";
import svg_temp from "@drugflow/components/icon/svg_temp.vue";
import custom_dialog from "@drugflow/components/dialog/custom_dialog.vue";
import notice_dialog from "./components/notice_dialog.vue";

export default {
  name: "app_title_topbar",
  components: { task_state, change_language, svg_temp, custom_dialog, notice_dialog },
  props: {
    space_id: {
      type: Number
    },
    task_type: {
      type: String,
      default: "all"
    }
  },
  setup() {
    const { proxy } = getCurrentInstance();
    function change(type) {
      proxy.$i18n.locale = type;
    }
    const { t } = useI18n();
    const router = useRouter();
    const router_push = command => {
      router.push(command);
    };
    const dialogOptions1 = ref({
      visible: false,
      top: "15vh",
      width: "550px",
      center: true,
      title: t("index.意见反馈"),
      data: {}
    });
    const search = ref("");
    const privatization = ref(sessionStorage.getItem("privatization"));
    const open_doc_url = () => {
      if (proxy.$i18n.locale === "en") {
        window.open("https://documents.drugflow.com/guide");
      } else {
        window.open("https://documents.drugflow.com/zh/guide");
      }
    };

    return {
      t,
      change,
      Search,
      router_push,
      search,
      open_doc_url,
      dialogOptions1,
      privatization
    };
  },
  methods: {
    open_notice() {
      this.dialogOptions1.visible = true;
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
          this.router_push({ name: "signin" });
          localStorage.removeItem("cs_is_staff");
          localStorage.removeItem("cs_user_info");
          localStorage.setItem("cs_signined", "false");
        })
        .catch(() => {
          ElMessage.error(this.t("message.登出失败"));
        });
    }
  }
};
</script>

<style lang="css" scoped>
.top_nav {
  height: 3.35rem;
  padding: 0 2rem;
}
.topnav_link {
  line-height: 3.35rem;
  height: 3.35rem;
  font-size: 0.9rem;
  text-align: center;
  padding: 0 0.28rem;
}
.text12rem {
  font-size: 12px;
}
</style>
