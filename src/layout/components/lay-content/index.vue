<script setup lang="ts">
import { useI18n } from "vue-i18n";
import LayFrame from "../lay-frame/index.vue";
import LayFooter from "../lay-footer/index.vue";
import { useTags } from "@/layout/hooks/useTag";
import { useGlobal, isNumber } from "@pureadmin/utils";
import BackTopIcon from "@/assets/svg/back_top.svg?component";
import { h, computed, Transition, defineComponent } from "vue";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { pxToRem } from "@/utils/rem";
const props = defineProps({
  fixedHeader: Boolean
});

const { t } = useI18n();
const { showModel } = useTags();
const { $storage, $config } = useGlobal<GlobalPropertiesApi>();

const isKeepAlive = computed(() => {
  return $config?.KeepAlive;
});

const transitions = computed(() => {
  return route => {
    return route.meta.transition;
  };
});

const hideTabs = computed(() => {
  return $storage?.configure.hideTabs;
});

const hideFooter = computed(() => {
  return $storage?.configure.hideFooter;
});

const stretch = computed(() => {
  return $storage?.configure.stretch;
});

const layout = computed(() => {
  return $storage?.layout.layout === "vertical";
});

const getMainWidth = computed(() => {
  return isNumber(stretch.value) ? pxToRem(stretch.value) : stretch.value ? pxToRem(1440) : "100%";
});

const getSectionStyle = computed(() => {
  return [hideTabs.value && layout ? `padding-top: ${pxToRem(48)};` : "", !hideTabs.value && layout ? (showModel.value == "chrome" ? `padding-top: ${pxToRem(85)};` : `padding-top: ${pxToRem(81)};`) : "", hideTabs.value && !layout.value ? `padding-top: ${pxToRem(48)};` : "", !hideTabs.value && !layout.value ? (showModel.value == "chrome" ? `padding-top: ${pxToRem(85)};` : `padding-top: ${pxToRem(81)};`) : "", props.fixedHeader ? "" : `padding-top: 0;${hideTabs.value ? `min-height: calc(100vh - ${pxToRem(48)});` : `min-height: calc(100vh - ${pxToRem(86)});`}`];
});

const transitionMain = defineComponent({
  props: {
    route: {
      type: undefined,
      required: true
    }
  },
  render() {
    const transitionName = transitions.value(this.route)?.name || "fade-transform";
    const enterTransition = transitions.value(this.route)?.enterTransition;
    const leaveTransition = transitions.value(this.route)?.leaveTransition;
    return h(
      Transition,
      {
        name: enterTransition ? "pure-classes-transition" : transitionName,
        enterActiveClass: enterTransition ? `animate__animated ${enterTransition}` : undefined,
        leaveActiveClass: leaveTransition ? `animate__animated ${leaveTransition}` : undefined,
        mode: "out-in",
        appear: true
      },
      {
        default: () => [this.$slots.default()]
      }
    );
  }
});
</script>

<template>
  <section :class="[fixedHeader ? 'app-main' : 'app-main-nofixed-header']" :style="getSectionStyle">
    <router-view>
      <template #default="{ Component, route }">
        <LayFrame :currComp="Component" :currRoute="route">
          <template #default="{ Comp, fullPath, frameInfo }">
            <el-scrollbar
              v-if="fixedHeader"
              :wrap-style="{
                display: 'flex',
                'flex-wrap': 'wrap',
                'max-width': getMainWidth,
                margin: '0 auto',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
              }"
              :view-style="{
                display: 'flex',
                flex: 'auto',
                overflow: 'hidden',
                'flex-direction': 'column'
              }"
            >
              <el-backtop :title="t('buttons.pureBackTop')" target=".app-main .el-scrollbar__wrap">
                <BackTopIcon />
              </el-backtop>
              <div class="grow flex">
                <transitionMain :route="route">
                  <keep-alive v-if="isKeepAlive" :include="usePermissionStoreHook().cachePageList">
                    <component :is="Comp" :key="fullPath" :frameInfo="frameInfo" class="main-content" />
                  </keep-alive>
                  <component :is="Comp" v-else :key="fullPath" :frameInfo="frameInfo" class="main-content" />
                </transitionMain>
              </div>
              <!-- <LayFooter v-if="!hideFooter" /> -->
            </el-scrollbar>
            <div v-else class="grow">
              <transitionMain :route="route">
                <keep-alive v-if="isKeepAlive" :include="usePermissionStoreHook().cachePageList">
                  <component :is="Comp" :key="fullPath" :frameInfo="frameInfo" class="main-content" />
                </keep-alive>
                <component :is="Comp" v-else :key="fullPath" :frameInfo="frameInfo" class="main-content" />
              </transitionMain>
            </div>
          </template>
        </LayFrame>
      </template>
    </router-view>

    <!-- 页脚 -->
    <LayFooter v-if="!hideFooter && !fixedHeader" />
  </section>
</template>

<style scoped>
.app-main {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
}

.app-main-nofixed-header {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.main-content {
  /* margin: 24px; */
}
</style>
