import type { App } from "vue";
import { setupAutoAnimate } from "./autoAnimate";
import { setupDayjs } from "./dayjs";
import { setupI18n } from "./i18n";

export function setupPlugins(app: App) {
  setupDayjs();
  setupAutoAnimate(app);
  setupI18n(app);
}
