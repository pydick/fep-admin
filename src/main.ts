import App from "./App.vue";
import router from "./router";
import { setupStore } from "@/store";
import { useI18n } from "@/plugins/i18n";
import { getPlatformConfig } from "./config";
import { MotionPlugin } from "@vueuse/motion";
// import { useEcharts } from "@/plugins/echarts";
import { createApp, type Directive } from "vue";
import { useElementPlus } from "@/plugins/elementPlus";
import { injectResponsiveStorage } from "@/utils/responsive";
import { setupPlugins } from "./plugins";
import Table from "@pureadmin/table";
import elementIcon from "@/plugins/svgicon";
import VXETable from "vxe-table";
import websocket from "@drugflow/utils/websocket";
import VueTippy from "vue-tippy";
import { qiankunWindow, renderWithQiankun } from "vite-plugin-qiankun/dist/helper";
// 自定义指令
import * as directives from "@/directives";
// 全局注册@iconify/vue图标库
import { IconifyIconOffline, IconifyIconOnline, FontIcon } from "./components/ReIcon";

// 全局注册按钮级别权限组件
import { Auth } from "@/components/ReAuth";
import { Perms } from "@/components/RePerms";
// import PureDescriptions from "@pureadmin/descriptions";

// 引入重置样式
import "./style/reset.scss";
// 导入公共样式
import "./style/index.scss";
// 一定要在main.ts中导入tailwind.css，防止vite每次hmr都会请求src/style/index.scss整体css文件导致热更新慢的问题
import "./style/tailwind.css";
import "element-plus/dist/index.css";
// 导入字体图标
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";

// 全局注册vue-tippy
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import "vxe-table/lib/style.css";
import "./style/drugflow-global.scss";

let app = null;

function render(props = {}) {
  const { container } = props;
  app = createApp(App);
  Object.keys(directives).forEach(key => {
    app.directive(key, (directives as { [key: string]: Directive })[key]);
  });
  app.component("IconifyIconOffline", IconifyIconOffline);
  app.component("IconifyIconOnline", IconifyIconOnline);
  app.component("FontIcon", FontIcon);
  app.component("Auth", Auth);
  app.component("Perms", Perms);
  app.use(VueTippy);

  getPlatformConfig(app).then(async config => {
    setupStore(app);
    setupPlugins(app);
    app.use(elementIcon);
    app.use(VXETable);
    app.use(router);
    app.provide("websocket", websocket);
    await router.isReady();
    injectResponsiveStorage(app, config);
    app.use(MotionPlugin).use(useI18n).use(useElementPlus).use(Table);
    // .use(PureDescriptions)
    // .use(useEcharts);
    const containerEl = container ? container.querySelector("#app") : "#app";
    app.mount(containerEl);
  });
}

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
} else {
  renderWithQiankun({
    mount(props) {
      console.log("[Vue微应用] mount", props);
      render(props);
    },
    bootstrap() {
      console.log("[Vue微应用] bootstrap");
    },
    update() {
      console.log("[Vue微应用] update");
    },
    unmount() {
      console.log("[Vue微应用] unmount");
      if (app) {
        app.unmount();
        app = null;
      }
    }
  });
}
