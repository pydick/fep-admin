<template>
  <el-upload ref="upload_ref" :auto-upload="false" :on-change="file_on_change" :show-file-list="true" :accept="file_accept" style="width: 100%">
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
import { ossUpload, checkProtein } from "@/api/fep";
import { ref } from "vue";

export default {
  name: "upload",
  components: {},
  props: {
    file_name: {
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
    const file_action = ref();
    const file_osskey = ref();
    const type_arr = props.file_accept.split(",").map(function (item) {
      return item.trim().substring(1);
    });
    const privatization = ref(sessionStorage.getItem("privatization"));
    return {
      t,
      context,
      type_arr,
      file_action,
      file_osskey,
      privatization
    };
  },
  methods: {
    async file_on_change(file, fileList) {
      console.log(1111, fileList);
      if (fileList.length > 1) {
        fileList.splice(0, 1);
      }
      if (fileList.length) {
        const formData = new FormData();
        formData.append("file", file.raw);
        console.log(file);
        const checkRes = await checkProtein(formData);
        if (checkRes.success) {
          const res = await ossUpload(formData);
          if (res.success) {
            this.$emit("uploadSuc", res.data.key, file);
          } else {
            ElMessage.error("上传失败");
          }
        } else {
          ElMessage.error("检查未通过");
        }
      }
    }
  }
};
</script>

<style scoped></style>
