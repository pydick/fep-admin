<template>
  <div>
    <div style="height: 470px">
      <el-form ref="formRef" :model="ruleForm" :rules="rules" class="demo-ruleForm" style="font-size: 0.8rem; padding-right: 15px; overflow-y: auto; height: calc(100% - 50px)" :hide-required-asterisk="true" label-position="top">
        <el-form-item :label="t('message.问题类型')" prop="issue_type">
          <el-radio-group v-model="ruleForm.issue_type">
            <el-radio-button :label="t('message.卡顿')" />
            <el-radio-button :label="t('message.界面及操作')" />
            <el-radio-button :label="t('message.账号相关')" />
            <el-radio-button :label="t('message.其他')" />
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('message.问题描述')" prop="issue">
          <el-input v-model="ruleForm.issue" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item :label="t('message.上传截图')">
          <el-upload v-model="fileList" :auto-upload="false" :multiple="true" list-type="picture-card" :on-preview="handlePictureCardPreview" :on-change="file_on_change" :on-remove="file_on_change" accept=".png,.jpg,.jpeg" style="width: 100%">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <el-form-item style="margin-top: 15px; margin-bottom: 0">
        <div style="width: 100%; text-align: right">
          <el-button :loading="submit_loading" type="success" @click="submitForm(formRef)">{{ t("message.提交") }}</el-button>
        </div>
      </el-form-item>
    </div>
    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { get_feedback } from "@drugflow/api/data.js";
import { reactive, ref, defineProps, toRef, defineEmits, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  options: Object
});
const options = ref(props.options);
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const formRef = ref();
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const submit_loading = ref(false);
const ruleForm = reactive({
  issue_type: "",
  issue: "",
  images: ""
});
const fileList = ref([]);
const rules = reactive({
  issue_type: [{ trigger: "change", required: true }],
  issue: [{ trigger: "blur", required: true }]
});

const handlePictureCardPreview = uploadFile => {
  dialogImageUrl.value = uploadFile.url;
  dialogVisible.value = true;
};
const submitForm = formName => {
  if (!formName) return;
  formName.validate(valid => {
    if (valid) {
      submit_loading.value = true;
      let images = [];
      const formData = new FormData();
      formData.append("issue_type", ruleForm.issue_type);
      formData.append("issue", ruleForm.issue);
      fileList.value.map(item => {
        formData.append("images", item.raw);
      });
      get_feedback(formData)
        .then(() => {
          ElMessage({
            message: t("message.操作成功"),
            type: "success"
          });
          options.value.visible = false;
          submit_loading.value = false;
        })
        .catch(err => {
          console.error(err);
          submit_loading.value = false;
        });
    }
  });
};
const file_on_change = (file, fileLists) => {
  fileList.value = fileLists;
};
onMounted(() => {});
</script>
<style scoped lang="scss">
.title {
  font-weight: bold;
}

:deep(.el-upload) {
  width: 148px !important;
}
.el-form-item {
  margin-bottom: 20px;
}
:deep(.el-form-item__label) {
  width: 100% !important;
  margin-bottom: 0 !important;
}
:deep(.el-upload-list__item-preview) {
  display: none;
}
:deep(.el-upload-list) {
  display: inline-flex !important;
}
</style>
