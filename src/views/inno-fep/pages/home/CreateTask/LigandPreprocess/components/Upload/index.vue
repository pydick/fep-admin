<template>
  <el-upload ref="upload_ref" :auto-upload="false" :on-change="file_on_change" :show-file-list="false" :accept="file_accept" style="width: 100%">
    <template #trigger>
      <el-input :modelValue="file_name" :input-style="{ textAlign: 'center' }" :placeholder="inp_placeholder" readonly style="width: 100%; cursor: pointer">
        <template v-if="is_slot" #append>
          <slot />
        </template>
      </el-input>
    </template>
  </el-upload>
</template>

<script>
import { useI18n } from "vue-i18n";
import { ligandUpload, appendMolecules } from "@/api/fep";
import { ref } from "vue";

export default {
  name: "upload",
  components: {},
  props: {
    uploadType: {
      type: String,
      default: "add"
    },
    file_name: {
      type: String,
      default: ""
    },
    taskId: {
      type: String,
      default: ""
    },
    inp_placeholder: {
      type: String,
      default: ""
    },
    file_accept: {
      type: String,
      default: ""
    },
    task_type: {
      type: String,
      default: "data_center"
    },
    ws_id: {
      type: String,
      default: ""
    },
    is_slot: {
      type: Boolean,
      default: true
    },
    is_big_file: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { t } = useI18n();
    const upload_ref = ref(null);
    const file_action = ref();
    const file_osskey = ref();
    const type_arr = props.file_accept.split(",").map(function (item) {
      return item.trim().substring(1);
    });
    const privatization = ref(sessionStorage.getItem("privatization"));
    context.expose({
      triggerClick: () => {
        const upload = upload_ref.value;
        if (upload && upload.$el) {
          const input = upload.$el.querySelector('input[type="file"]');
          if (input) {
            input.value = ""; // 清空 input 的值，确保每次都能触发 change 事件
            input.click();
          }
        }
      }
    });
    return {
      t,
      context,
      type_arr,
      file_action,
      file_osskey,
      privatization,
      upload_ref
    };
  },
  methods: {
    async file_on_change(file, fileList) {
      if (fileList.length >= 1) {
        fileList.slice(0, 1);
      }
      if (fileList.length) {
        if (this.uploadType === "add") {
          const formData = new FormData();
          formData.append("file", file.raw);
          const res = await ligandUpload(formData);
          if (res.success) {
            this.$emit("uploadSuc", res.data, file.name);
          } else {
            ElMessage.error("上传失败");
          }
        } else if (this.uploadType === "append") {
          const formData = new FormData();
          formData.append("task_id", this.taskId);
          formData.append("file", file.raw);
          const res = await appendMolecules(formData);
          if (res.success) {
            this.$emit("uploadSuc", res.data, file.name);
          } else {
            ElMessage.error("上传失败");
          }
        }
      }
    }
  }
};
</script>

<style scoped></style>
