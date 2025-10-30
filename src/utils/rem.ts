/**
 * rem 适配工具函数
 * 基于 1920*1080 分辨率，系统缩放 100% 为基准
 */

// 设计稿基准宽度（1920px）
const BASE_WIDTH = 1920;
// 设计稿基准高度（1080px）
const BASE_HEIGHT = 1080;
// 基准根字体大小（16px）
const BASE_FONT_SIZE = 16;

/**
 * 设置根字体大小
 * @param fontSize 字体大小
 */
function setRootFontSize(fontSize: number): void {
  document.documentElement.style.fontSize = `${fontSize}px`;
}

/**
 * 计算当前屏幕的根字体大小
 * @returns 计算后的根字体大小
 */
function calculateFontSize(): number {
  const devicePixelRatio = window.devicePixelRatio || 1;

  // window.innerWidth 是 CSS 像素（逻辑像素）
  // 对于不同 DPI 和系统缩放，可能需要调整
  const cssWidth = window.innerWidth;
  const cssHeight = window.innerHeight;

  // 方案A：直接使用 CSS 像素（推荐，适合大多数情况）
  const scaleX = cssWidth / BASE_WIDTH;
  const scaleY = cssHeight / BASE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  let fontSize = BASE_FONT_SIZE * scale;

  // 根据 devicePixelRatio 调整字体范围
  const minFontSize = 16; // 高 DPI 屏幕可以更小
  const maxFontSize = 16;

  fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize));

  if (process.env.NODE_ENV === "development") {
    console.log("[REM调试]", {
      windowSize: `${cssWidth}x${cssHeight}`,
      devicePixelRatio: devicePixelRatio.toFixed(2),
      scaleX: scaleX.toFixed(3),
      scaleY: scaleY.toFixed(3),
      finalScale: scale.toFixed(3),
      fontSize: fontSize.toFixed(2),
      minFontSize,
      physicalSize: `${(cssWidth * devicePixelRatio).toFixed(0)}x${(cssHeight * devicePixelRatio).toFixed(0)}`
    });
  }

  return fontSize;
}

/**
 * 初始化 rem 适配
 */
function initRem(): void {
  // 设置初始字体大小
  const fontSize = calculateFontSize();
  setRootFontSize(fontSize);

  // 监听窗口大小变化
  let resizeTimer: NodeJS.Timeout | null = null;

  const handleResize = (): void => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    resizeTimer = setTimeout(() => {
      const newFontSize = calculateFontSize();
      setRootFontSize(newFontSize);
    }, 100);
  };

  window.addEventListener("resize", handleResize);

  // 监听系统缩放变化（如果支持）
  if (window.devicePixelRatio !== undefined) {
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mediaQuery.addEventListener("change", handleResize);
  }
}

/**
 * px 转 rem
 * @param px px 值
 * @returns rem 值
 * 注意：使用基准字体大小计算，这样 rem 值会随根字体大小按比例缩放
 */
function pxToRem(px: number): string {
  // 始终使用基准字体大小计算，让 rem 值固定
  // 这样实际像素值会随根字体大小自动缩放
  return `${px / BASE_FONT_SIZE}rem`;
}

export function pxToRemPx(px: number): number {
  const remValue = px / BASE_FONT_SIZE;
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || BASE_FONT_SIZE;
  return remValue * rootFontSize;
}

/**
 * rem 转 px
 * @param rem rem 值
 * @returns px 值
 */
function remToPx(rem: number): number {
  return rem * BASE_FONT_SIZE;
}

export { initRem, calculateFontSize, setRootFontSize, pxToRem, remToPx, BASE_WIDTH, BASE_HEIGHT, BASE_FONT_SIZE };
