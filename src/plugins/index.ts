import type { App } from "vue";
import { setupAutoAnimate } from "./autoAnimate";
import { setupDayjs } from "./dayjs";
import { setupI18n } from "./i18n";
import { setupTanstackVueQuery } from "./tanstack-vue-query";

export function setupPlugins(app: App) {
  setupDayjs();
  setupAutoAnimate(app);
  setupTanstackVueQuery(app);
  setupI18n(app);
}
