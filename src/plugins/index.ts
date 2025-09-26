import type { App } from "vue";
import { setupAutoAnimate } from "./autoAnimate";
import { setupDayjs } from "./dayjs";

export function setupPlugins(app: App) {
  setupDayjs();
  setupAutoAnimate(app);
}
