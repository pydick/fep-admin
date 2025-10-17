// @ts-check

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    "postcss-pxtorem": {
      // 根字体大小，基于 1920*1080 分辨率，系统缩放 100% 为基准
      rootValue: 16,
      // 需要转换的属性，* 表示所有
      propList: ["*"],
      // 排除不需要转换的文件
      exclude: /node_modules/i,
      // 保留小数位数
      unitPrecision: 5,
      // 媒体查询中是否转换 px
      mediaQuery: false,
      // 最小转换值，小于此值不转换
      minPixelValue: 0,
      // 排除某些选择器，保持 px 单位
      selectorBlackList: ["html"],
      // 替换包含 rem 的规则，而不是添加回退
      replace: true
    },
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {})
  }
};
