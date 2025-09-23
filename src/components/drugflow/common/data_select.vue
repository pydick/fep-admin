<template>
  <el-dialog :modelValue="if_show" :title="name" width="70%" :before-close="handleConfirm">
    <div style="min-height: 40vh; max-height: 60vh; padding: 0 5rem; overflow-y: auto">
      <el-row v-if="data_list.length" :gutter="20">
        <el-col v-for="item in change_list(data_list)" :key="item.dataset_id" :span="8" style="margin-bottom: 1rem">
          <el-button :title="item.name" bg style="width: 100%; overflow: hidden" text type="info" @click="sendDataToParent(item.dataset_id, item.name, item.extras?.osskey)">
            <div style="display: flex; height: 1.1rem; justify-content: center">
              <span style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis">{{ item.name.split(".").slice(0, -1).join(".") }}.</span>
              <span>{{ item.name.split(".").pop() }}</span>
            </div>
            <!--            {{ item.name }}-->
          </el-button>
        </el-col>
      </el-row>
      <div v-else style="min-height: 40vh; display: flex; justify-content: center; align-items: center">
        <span>{{ t("data.数据中心为空") }}</span>
      </div>
    </div>
  </el-dialog>
  <Spinner ref="spinner_ref" />
</template>

<script>
import { useI18n } from "vue-i18n";
import { dataset_content } from "@drugflow/api/qsar";
import Spinner from "@drugflow/common/spinner.vue";

export default {
  name: "data_select",
  components: {
    Spinner
  },
  props: {
    name: {
      type: String
    },
    data_list: {
      type: Array
    },
    if_show: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { t } = useI18n();
    return {
      t,
      context
    };
  },
  watch: {
    if_show(newV, oldV) {
      this.context.emit("update:if_show", newV);
    }
  },
  methods: {
    change_list(list) {
      // 去除list中的name中包含_DFFixed
      return list.filter(item => !item.name.includes("_DFFixed"));
    },
    handleConfirm() {
      this.context.emit("update:if_show", false);
    },
    sendDataToParent(id, name, osskey) {
      this.context.emit("update:if_show", false);
      this.context.emit("custom-event", { id, name, osskey });
    }
  }
};
</script>

<style scoped>
:deep(.el-button) > span {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 1rem;
}
</style>
