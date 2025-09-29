<script setup lang="ts">
import Motion from "../utils/motion";
import AuthLayout from "../components/AuthLayout.vue";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "../utils/rule";
import { ref, reactive } from "vue";
import { debounce } from "@pureadmin/utils";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { signin_api } from "@drugflow/api/user.js";
import { useI18n } from "vue-i18n";

import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";

const { t } = useI18n();

defineOptions({
  name: "Signin"
});

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();

const ruleForm = reactive({
  username: "",
  password: ""
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      loading.value = true;
      const formData = new FormData();
      formData.append("phone", "1234567890");
      formData.append("email", ruleForm.username);
      formData.append("password", ruleForm.password);
      const res = await signin_api(formData);
      if (res.success) {
        localStorage.setItem("cs_signined", "true");
      }
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password
        })
        .then(res => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true;
              router
                .push(getTopMenu(true).path)
                .then(() => {
                  message("登录成功", { type: "success" });
                })
                .finally(() => (disabled.value = false));
            });
          } else {
            message("登录失败", { type: "error" });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

const immediateDebounce: any = debounce(formRef => onLogin(formRef), 1000, true);

useEventListener(document, "keydown", ({ code }) => {
  if (["Enter", "NumpadEnter"].includes(code) && !disabled.value && !loading.value) immediateDebounce(ruleFormRef.value);
});

const onRegister = () => {
  router.push("/signup");
};
</script>

<template>
  <AuthLayout>
    <Motion :delay="50">
      <el-form-item>
        {{ t("login.pureNoAccount") }}
        <el-button link type="primary" @click="onRegister">{{ t("login.pureCreateAccount") }}</el-button>
      </el-form-item>
    </Motion>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="loginRules" size="large">
      <Motion :delay="100">
        <el-form-item
          :rules="[
            {
              required: true,
              message: t('login.pureUsernameReg'),
              trigger: 'blur'
            }
          ]"
          prop="username"
        >
          <el-input v-model="ruleForm.username" clearable :placeholder="t('login.pureUsername')" :prefix-icon="useRenderIcon(User)" />
        </el-form-item>
      </Motion>

      <Motion :delay="150">
        <el-form-item prop="password">
          <el-input v-model="ruleForm.password" clearable show-password :placeholder="t('login.purePassword')" :prefix-icon="useRenderIcon(Lock)" />
        </el-form-item>
      </Motion>

      <Motion :delay="250">
        <el-button class="w-full mt-4!" size="default" type="primary" :loading="loading" :disabled="disabled" @click="onLogin(ruleFormRef)">{{ t("login.pureLogin") }}</el-button>
      </Motion>
    </el-form>
  </AuthLayout>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
