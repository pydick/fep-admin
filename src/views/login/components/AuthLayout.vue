<script setup lang="ts">
import { ref, toRaw } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { bg, avatar, illustration } from "../utils/static";
import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import { useLayout } from "@/layout/hooks/useLayout";
import Motion from "../utils/motion";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";

defineOptions({
  name: "AuthLayout"
});

const { initStorage } = useLayout();
initStorage();
useTranslationLang();

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title } = useNav();

// 定义插槽
defineSlots<{
  default: () => any;
}>();
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题切换器 -->
      <!-- <el-switch v-model="dataTheme" inline-prompt :active-icon="dayIcon" :inactive-icon="darkIcon" @change="dataThemeChange" /> -->
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <Motion>
            <h2 class="outline-hidden">
              <avatar class="avatar inline-block! align-middle mr-[10px]" />
              <span class="inline-block! align-middle h-[45px] leading-[45px]">{{ title }}</span>
            </h2>
          </Motion>
          <!-- 内容插槽 -->
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
