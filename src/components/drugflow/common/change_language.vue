<template>
  <el-dropdown>
    <el-button circle style="color: #ffffff; background: #005eea; border: 1px solid #fff">
      <chinese_svg v-if="language === 'en'" width="16px" height="16px" color="#ffffff" />
      <english_svg v-else width="16px" height="16px" color="#ffffff" />
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="change_language('en')">English</el-dropdown-item>
        <el-dropdown-item @click="change_language('zh')">简体中文</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import english_svg from "@drugflow/components/icon/english_svg.vue";
import chinese_svg from "@drugflow/components/icon/chinese_svg.vue";
import { inject, getCurrentInstance } from "vue";

export default {
  name: "change_language",
  components: { english_svg, chinese_svg },
  props: {
    if_text: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const language = inject("language");
    const { proxy } = getCurrentInstance();
    if (localStorage.getItem("cs_language")) {
      language.value = localStorage.getItem("cs_language");
    } else {
      // language.value = proxy.$i18n.locale;
    }

    return {
      language
    };
  },
  methods: {
    change_language(lan) {
      if (this.$i18n.locale !== lan) {
        this.$i18n.locale = lan;
        this.language = lan;
        localStorage.setItem("cs_language", lan);
      }
    }
  }
};
</script>

<style scoped>
.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
