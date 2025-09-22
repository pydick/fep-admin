// @ts-check

/** @type {import("prettier").Config} */
export default {
  bracketSpacing: true,
  singleQuote: false,
  arrowParens: "avoid",
  trailingComma: "none",
  
  // 全局禁用单属性换行
  singleAttributePerLine: false,
  // 设置较大的打印宽度避免过早换行
  printWidth: 120,
  
  // Vue文件特殊配置
  overrides: [
    {
      files: "*.vue",
      options: {
        // Vue template中的HTML属性不换行
        singleAttributePerLine: false,
        // 设置较大的打印宽度
        printWidth: 150,
        // 保持HTML标签属性在同一行
        htmlWhitespaceSensitivity: "ignore"
      }
    }
  ]
};
