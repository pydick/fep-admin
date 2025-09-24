<template>
  <el-tooltip v-if="dataset_id === ''" :content="t('result.请先保存数据集')" class="box-item" effect="dark" placement="bottom-end">
    <el-button :disabled="dataset_id === ''" style="margin: 0 0.5rem" type="primary">
      <!--                    {{ t('result.创建新任务') }}-->
      <svg_temp name="create_task" color="#fff" width="18" height="18" />
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </el-button>
  </el-tooltip>
  <el-dropdown v-else trigger="click">
    <div style="margin: 0 0.5rem">
      <el-tooltip class="box-item" effect="dark" :content="t('result.创建新任务')" placement="top">
        <el-button type="primary">
          <!--          {{ t('result.创建新任务') }}-->
          <svg_temp name="create_task" color="#fff" width="18" height="18" />
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
    <template #dropdown>
      <el-dropdown-menu style="padding: 0 0.5rem 0.4rem 0.5rem; min-width: 6rem">
        <div v-for="item in creation_list" :key="item">
          <el-dropdown-item :disabled="item.disabled" @click="create_task(item.value)">
            {{ t(item.label) }}
          </el-dropdown-item>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { dataset_metainfo } from "@drugflow/api/qsar";
import { link_list } from "@drugflow/utils/common";
import { useRouter } from "vue-router";

export default {
  name: "creation_task",
  components: {},
  props: {
    dataset_id: {
      type: String,
      default: ""
    }
  },
  setup(props, context) {
    const { t } = useI18n();
    const router = useRouter();
    const dialogVisible = ref(false);
    const option = ref("");
    const creation_list = ref();
    const file_type = ref("");
    const file_name = ref("");
    const osskey = ref("");
    return {
      t,
      router,
      dialogVisible,
      option,
      creation_list,
      file_type,
      file_name,
      osskey
    };
  },
  watch: {
    dataset_id(newVal) {
      this.update();
    }
  },
  mounted() {
    this.update();
  },
  methods: {
    create_task(type) {
      this.option = type;
      const { href } = this.router.resolve({
        path: "/" + type,
        query: {
          dataset_id: this.dataset_id,
          file_type: this.file_type,
          file_name: this.file_name,
          osskey: this.osskey
        }
      });
      window.open(href, "_blank");
    },
    update() {
      if (this.dataset_id) {
        dataset_metainfo(this.dataset_id).then(res => {
          // console.log(res.data.name.split('.').pop())
          this.file_name = res.data.name;
          this.osskey = res.data.extras_info?.osskey;

          if (res.data.name.split(".").pop() === "csv") {
            this.file_type = "csv";
            this.creation_list = link_list("csv");
          } else if (res.data.name.split(".").pop() === "sdf") {
            this.file_type = "sdf";
            this.creation_list = link_list("sdf");
          } else if (res.data.name.split(".").pop() === "pdf" || res.data.name.split(".").pop() === "jpg" || res.data.name.split(".").pop() === "png") {
            this.file_type = "pdf";
            this.creation_list = link_list("pdf");
          } else {
            this.file_type = "pdb";
            this.creation_list = link_list("pdb");
          }
        });
      }
    }
  }
};
</script>

<style lang="css" scoped>
:deep(.left_main_bar) {
  display: none;
}
</style>
