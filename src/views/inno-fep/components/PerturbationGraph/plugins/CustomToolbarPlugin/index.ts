import { BasePlugin } from "@antv/g6";
import type { BasePluginOptions, RuntimeContext } from "@antv/g6";
import { createApp } from "vue";
import CustomToolbar from "./customToolbar/index.vue";
import { useElementPlus } from "@/plugins/elementPlus";

interface CustomToolbarPluginOptions extends BasePluginOptions {
  className?: string; // 可选，自定义 CSS 类名
}

export class CustomToolbarPlugin extends BasePlugin<CustomToolbarPluginOptions> {
  private app: any = null;
  private container: HTMLElement | null = null;

  constructor(context: RuntimeContext, options: CustomToolbarPluginOptions) {
    super(context, options);
    this.initToolbar();
  }

  /** 初始化 Toolbar Vue 实例 */
  private initToolbar() {
    const { canvas, graph } = this.context;
    const canvasContainer = canvas?.getContainer?.();
    if (!canvasContainer) return;

    // 创建外层容器
    this.container = document.createElement("div");
    this.container.className = this.options.className || "custom-toolbar-container";

    // 不设置 position、top、right 样式，由外部控制
    const parentEl = canvasContainer.parentElement ?? canvasContainer;
    parentEl.appendChild(this.container);

    // 挂载 Vue 组件
    this.app = createApp(CustomToolbar, { graph });
    useElementPlus(this.app);
    this.app.mount(this.container);
  }

  /** 销毁插件 */
  public destroy() {
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }
}
