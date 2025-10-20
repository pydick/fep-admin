// @ts-check

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    "postcss-pxtorem": {
      // 根字体大小，基于 1920*1080 分辨率，系统缩放 100% 为基准
      rootValue: 16,
      // 需要转换的属性，* 表示所有
      propList: ["*"],
      // 排除所有 node_modules，但保留 element-plus
      exclude: function (file) {
        // 如果文件路径包含 node_modules
        if (file.includes("node_modules")) {
          // 但如果是 element-plus，则不排除（返回 false 表示不排除）
          return !file.includes("element-plus");
        }
        // 其他文件不排除
        return false;
      },
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
