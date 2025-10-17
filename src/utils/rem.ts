/**
 * rem 适配工具函数
 * 基于 1920*1080 分辨率，系统缩放 100% 为基准
 */

// 设计稿基准宽度（1920px）
const BASE_WIDTH = 1920
// 设计稿基准高度（1080px）
const BASE_HEIGHT = 1080
// 基准根字体大小（16px）
const BASE_FONT_SIZE = 16

/**
 * 设置根字体大小
 * @param fontSize 字体大小
 */
function setRootFontSize(fontSize: number): void {
  document.documentElement.style.fontSize = `${fontSize}px`
}

/**
 * 计算当前屏幕的根字体大小
 * @returns 计算后的根字体大小
 */
function calculateFontSize(): number {
  const { innerWidth, innerHeight } = window
  
  // 计算宽高比
  const currentRatio = innerWidth / innerHeight
  const baseRatio = BASE_WIDTH / BASE_HEIGHT
  
  let fontSize: number
  
  if (currentRatio > baseRatio) {
    // 宽屏：以高度为基准
    fontSize = (innerHeight / BASE_HEIGHT) * BASE_FONT_SIZE
  } else {
    // 高屏：以宽度为基准
    fontSize = (innerWidth / BASE_WIDTH) * BASE_FONT_SIZE
  }
  
  // 限制字体大小范围，避免过小或过大
  fontSize = Math.max(12, Math.min(24, fontSize))
  
  return fontSize
}

/**
 * 初始化 rem 适配
 */
function initRem(): void {
  // 设置初始字体大小
  const fontSize = calculateFontSize()
  setRootFontSize(fontSize)
  
  // 监听窗口大小变化
  let resizeTimer: NodeJS.Timeout | null = null
  
  const handleResize = (): void => {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    
    resizeTimer = setTimeout(() => {
      const newFontSize = calculateFontSize()
      setRootFontSize(newFontSize)
    }, 100)
  }
  
  window.addEventListener('resize', handleResize)
  
  // 监听系统缩放变化（如果支持）
  if (window.devicePixelRatio !== undefined) {
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    mediaQuery.addEventListener('change', handleResize)
  }
}

/**
 * px 转 rem
 * @param px px 值
 * @returns rem 值
 */
function pxToRem(px: number): string {
  const fontSize = parseFloat(document.documentElement.style.fontSize) || BASE_FONT_SIZE
  return `${px / fontSize}rem`
}

/**
 * rem 转 px
 * @param rem rem 值
 * @returns px 值
 */
function remToPx(rem: number): number {
  const fontSize = parseFloat(document.documentElement.style.fontSize) || BASE_FONT_SIZE
  return rem * fontSize
}

export {
  initRem,
  calculateFontSize,
  setRootFontSize,
  pxToRem,
  remToPx,
  BASE_WIDTH,
  BASE_HEIGHT,
  BASE_FONT_SIZE
}

