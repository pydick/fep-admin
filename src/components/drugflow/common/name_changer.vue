<template>
  <div v-if="show_name" style="line-height: 2rem" class="flex_def flex_start">
    <div :class="{ huge_text: text_size === 'huge' }" :title="new_task_name" style="margin-right: 0.75rem; white-space: nowrap; text-overflow: ellipsis; max-width: calc(100vw - 850px); overflow: hidden" :style="{ 'min-width': limit_minwidth ? '200px' : 'unset' }">
      {{ new_task_name }}
    </div>
    <el-link :underline="false" class="hover_point" @click="show_name = false">
      <el-icon v-if="state === 'finished' || state === 'aborted'" :size="text_size === 'huge' ? 20 : 14"><Edit /></el-icon>
    </el-link>
  </div>

  <div v-else class="flex_def flex_start">
    <el-input
      v-model="new_task_name"
      :class="{
        huge_text_input: text_size === 'huge',
        huge_button: text_size === 'huge',
        normal_width: text_size === 'normal'
      }"
      style="max-width: 24rem; margin-right: 0.75rem"
      @keyup.enter="submit"
    />
    <el-button size="small" :class="{ huge_button: text_size === 'huge', normal_padding: text_size === 'normal' }" type="success" :loading="loading" @click="submit">
      <el-icon><Select /></el-icon>
    </el-button>
    <el-button size="small" :class="{ huge_button: text_size === 'huge', normal_padding: text_size === 'normal' }" @click="show_name = true">
      <el-icon><CloseBold /></el-icon>
    </el-button>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { change_name_api } from "@drugflow/api/person_center.js";
import { useI18n } from "vue-i18n";

export default {
  name: "name_changer",
  components: {},
  props: {
    old_task_name: {
      type: String,
      default: "Task Name"
    },
    text_size: {
      type: String,
      default: "normal"
    },
    task_id: {
      type: Number,
      default: 0
    },
    url: {
      type: String,
      default: "jobs"
    },
    limit_minwidth: {
      type: Boolean,
      default: false
    },
    state: {
      type: String
    },
    space_id: {
      type: String
    }
  },

  setup(props, context) {
    const { t } = useI18n();
    const show_name = ref(true);
    const new_task_name = ref(props.old_task_name);
    const loading = ref(false);
    watch(
      () => props.old_task_name,
      (newValue, oldValue) => {
        new_task_name.value = newValue;
      }
    );
    return { show_name, new_task_name, loading, t };
  },

  methods: {
    change_input_vmodel(task_name) {
      this.new_task_name = task_name;
    },
    submit() {
      const param = { name: this.new_task_name };
      this.loading = true;
      change_name_api(this.task_id, this.space_id, param, this.url)
        .then(res => {
          this.show_name = true;
          this.loading = false;
          ElMessage({
            message: this.t("message.修改成功"),
            type: "success"
          });
          this.$emit("update:old_task_name", this.new_task_name);
        })
        .catch(() => {
          this.loading = false;
          ElMessage.error(this.t("message.修改失败检查网络"));
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.huge_text {
  color: #333;
  font-weight: 700;
  font-size: 1.6rem;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
.huge_text_input {
  color: #333;
  font-weight: 700;
  font-size: 1.3rem;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
.huge_button {
  height: 1.6rem;
}
.normal_width {
  width: 10rem;
}
.normal_padding {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.hover_point:hover {
  cursor: pointer !important;
}
</style>

<style lang="css"></style>
