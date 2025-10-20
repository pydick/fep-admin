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

  // 获取实际屏幕尺寸
  const actualWidth = screen.width;
  const actualHeight = screen.height;

  // 计算逻辑分辨率（考虑系统缩放）
  const logicalWidth = actualWidth / devicePixelRatio;
  const logicalHeight = actualHeight / devicePixelRatio;

  // 使用逻辑分辨率计算缩放比例
  const scaleX = logicalWidth / BASE_WIDTH;
  const scaleY = logicalHeight / BASE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  const finalScale = scale; // 直接使用 scale

  let fontSize = BASE_FONT_SIZE * finalScale;

  // 限制字体大小范围
  fontSize = Math.max(12, Math.min(24, fontSize));

  // 添加调试信息
  if (process.env.NODE_ENV === "development") {
    console.log("[REM调试]", {
      screenSize: `${actualWidth}x${actualHeight}`,
      logicalSize: `${logicalWidth.toFixed(0)}x${logicalHeight.toFixed(0)}`,
      devicePixelRatio,
      scale: scale.toFixed(3),
      finalScale: finalScale.toFixed(3),
      fontSize: fontSize.toFixed(2)
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

/**
 * rem 转 px
 * @param rem rem 值
 * @returns px 值
 */
function remToPx(rem: number): number {
  return rem * BASE_FONT_SIZE;
}

export { initRem, calculateFontSize, setRootFontSize, pxToRem, remToPx, BASE_WIDTH, BASE_HEIGHT, BASE_FONT_SIZE };
