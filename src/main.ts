import App from "./App.vue";
import router from "./router";
import { setupStore } from "@/store";
import { getPlatformConfig } from "./config";
import { MotionPlugin } from "@vueuse/motion";
// import { useEcharts } from "@/plugins/echarts";
import { createApp, type Directive } from "vue";
import { useElementPlus } from "@/plugins/elementPlus";
import { injectResponsiveStorage } from "@/utils/responsive";
import { setupPlugins } from "./plugins";
import initQianKun from "./qianKuninit";
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";
import elementIcon from "@/plugins/svgicon";

import Table from "@pureadmin/table";
// import PureDescriptions from "@pureadmin/descriptions";

// 引入重置样式
import "./style/reset.scss";
// 导入公共样式
import "./style/index.scss";
// 一定要在main.ts中导入tailwind.css，防止vite每次hmr都会请求src/style/index.scss整体css文件导致热更新慢的问题
import "./style/tailwind.css";
import "element-plus/dist/index.css";
import "./style/drugflow-global.scss";
// 导入字体图标
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";
import websocket from "@drugflow/utils/websocket";
const app = createApp(App);

import VXETable from "vxe-table";
import "vxe-table/lib/style.css";

// 自定义指令
import * as directives from "@/directives";
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

// 全局注册@iconify/vue图标库
import { IconifyIconOffline, IconifyIconOnline, FontIcon } from "./components/ReIcon";
app.component("IconifyIconOffline", IconifyIconOffline);
app.component("IconifyIconOnline", IconifyIconOnline);
app.component("FontIcon", FontIcon);

// 全局注册按钮级别权限组件
import { Auth } from "@/components/ReAuth";
import { Perms } from "@/components/RePerms";
app.component("Auth", Auth);
app.component("Perms", Perms);

// 全局注册vue-tippy
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import VueTippy from "vue-tippy";
app.use(VueTippy);

// getPlatformConfig(app).then(async config => {
//   setupStore(app);
//   setupPlugins(app);
//   app.use(elementIcon);
//   app.use(VXETable);
//   app.use(router);
//   app.provide("websocket", websocket);
//   await router.isReady();
//   injectResponsiveStorage(app, config);
//   app.use(MotionPlugin).use(useElementPlus).use(Table);
//   // .use(PureDescriptions)
//   // .use(useEcharts);
//   app.mount("#app");
// });

async function render(props: any = {}) {
  const { container, activeRule } = props;
  getPlatformConfig(app).then(async config => {
    setupStore(app);
    setupPlugins(app);
    app.use(elementIcon);
    app.use(VXETable);
    app.use(router);
    app.provide("websocket", websocket);
    await router.isReady();
    injectResponsiveStorage(app, config);
    app.use(MotionPlugin).use(useElementPlus).use(Table);
    // .use(PureDescriptions)
    // .use(useEcharts);
    app.mount(container ? container.querySelector("#app") : "#app");

    app.config.globalProperties.$activeRule = activeRule;
  });
}

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
} else {
  initQianKun(render);
}
