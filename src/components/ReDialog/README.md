# ReDialog 使用文档

ReDialog 是一个功能强大的 Dialog 组件，基于 Element Plus Dialog 封装，提供了编程式调用、自定义渲染、全屏支持等高级功能。

## 特性

- ✅ 编程式调用对话框
- ✅ 自定义头部、内容和底部渲染
- ✅ 支持全屏/退出全屏
- ✅ 自定义底部按钮和操作
- ✅ 支持嵌套对话框
- ✅ 完整的生命周期回调
- ✅ 按钮 loading 状态管理
- ✅ Popconfirm 气泡确认支持

## 快速开始

### 1. 引入并注册组件

在 `App.vue` 中引入并注册 ReDialog 组件：

```vue
<template>
  <router-view />
  <!-- 必须引入，否则使用 addDialog 调用不会显示弹框 -->
  <ReDialog />
</template>

<script setup lang="ts">
import { ReDialog } from "@/components/ReDialog";

// 使用 withInstall 封装后自动注册
</script>
```

### 2. 基本使用

#### 简单对话框

```typescript
import { addDialog } from "@/components/ReDialog";

// 打开对话框
addDialog({
  title: "提示",
  contentRenderer: ({ options, index }) => {
    return h("div", "这是一个简单的对话框");
  }
});
```

#### 带确认和取消按钮

```typescript
import { addDialog } from "@/components/ReDialog";

addDialog({
  title: "确认操作",
  width: "500px",
  contentRenderer: ({ options, index }) => {
    return h("div", "确定要执行此操作吗？");
  },
  closeCallBack: ({ options, index, args }) => {
    if (args.command === "sure") {
      console.log("用户点击了确定");
    } else {
      console.log("用户点击了取消或关闭");
    }
  }
});
```

## 完整示例

### 示例 1: 表单对话框

```vue
<script setup lang="ts">
import { ref, h } from "vue";
import { addDialog } from "@/components/ReDialog";
import { ElInput, ElForm, ElFormItem } from "element-plus";

const showFormDialog = () => {
  const formData = ref({ name: "", email: "" });

  addDialog({
    title: "填写表单",
    width: "600px",
    contentRenderer: ({ options, index }) => {
      return h(
        ElForm,
        { labelWidth: "80px" },
        {
          default: () => [
            h(ElFormItem, { label: "姓名" }, {
              default: () => h(ElInput, {
                modelValue: formData.value.name,
                "onUpdate:modelValue": (val) => {
                  formData.value.name = val;
                }
              })
            }),
            h(ElFormItem, { label: "邮箱" }, {
              default: () => h(ElInput, {
                modelValue: formData.value.email,
                "onUpdate:modelValue": (val) => {
                  formData.value.email = val;
                }
              })
            })
          ]
        }
      );
    },
    closeCallBack: ({ args }) => {
      if (args.command === "sure") {
        console.log("提交表单:", formData.value);
      }
    }
  });
};
</script>
```

### 示例 2: 自定义按钮

```typescript
import { addDialog, type ButtonProps } from "@/components/ReDialog";

const showCustomButtonsDialog = () => {
  addDialog({
    title: "自定义按钮",
    contentRenderer: ({ options, index }) => {
      return h("div", "内容");
    },
    footerButtons: [
      {
        label: "取消",
        text: true,
        btnClick: ({ dialog: { options, index } }) => {
          console.log("点击了取消");
        }
      },
      {
        label: "删除",
        type: "danger",
        btnClick: ({ dialog: { options, index } }) => {
          console.log("点击了删除");
        }
      },
      {
        label: "确定",
        type: "primary",
        btnClick: ({ dialog: { options, index } }) => {
          console.log("点击了确定");
        }
      }
    ] as Array<ButtonProps>
  });
};
```

### 示例 3: 带确认框的删除对话框

```typescript
import { addDialog } from "@/components/ReDialog";

const showDeleteDialog = () => {
  addDialog({
    title: "删除确认",
    contentRenderer: ({ options, index }) => {
      return h("div", "确定要删除这条数据吗？");
    },
    popconfirm: {
      title: "真的确定要删除吗？"
    },
    closeCallBack: ({ args }) => {
      if (args.command === "sure") {
        console.log("执行删除操作");
      }
    }
  });
};
```

### 示例 4: 带 Loading 状态

```typescript
import { addDialog } from "@/components/ReDialog";

const showLoadingDialog = () => {
  addDialog({
    title: "处理中",
    contentRenderer: ({ options, index }) => {
      return h("div", "正在处理，请稍候...");
    },
    sureBtnLoading: true,
    beforeSure: (done, { index }) => {
      // 模拟异步操作
      setTimeout(() => {
        console.log("操作完成");
        done();
      }, 2000);
    }
  });
};
```

### 示例 5: 全屏对话框

```typescript
import { addDialog } from "@/components/ReDialog";

const showFullscreenDialog = () => {
  addDialog({
    title: "全屏编辑",
    fullscreen: true, // 强制全屏
    contentRenderer: ({ options, index }) => {
      return h("div", "这是全屏模式的对话框");
    }
  });
};

// 或者显示全屏图标，用户可以切换
const showFullscreenIconDialog = () => {
  addDialog({
    title: "可切换全屏",
    fullscreenIcon: true, // 显示全屏切换图标
    contentRenderer: ({ options, index }) => {
      return h("div", "可以点击右上角图标切换全屏");
    }
  });
};
```

### 示例 6: 嵌套对话框

```typescript
import { addDialog } from "@/components/ReDialog";

const showNestedDialog = () => {
  addDialog({
    title: "父对话框",
    width: "800px",
    appendToBody: true, // 嵌套对话框必须设置为 true
    contentRenderer: ({ options, index }) => {
      return h("div", [
        h("p", "父对话框内容"),
        h("button", {
          onClick: () => {
            // 打开子对话框
            addDialog({
              title: "子对话框",
              width: "500px",
              appendToBody: true, // 嵌套必须设置
              contentRenderer: ({ options, index }) => {
                return h("div", "子对话框内容");
              }
            });
          }
        }, "打开子对话框")
      ]);
    }
  });
};
```

## API

### addDialog(options)

打开一个新的对话框。

#### 参数: DialogOptions

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 对话框标题 | string | - |
| width | 对话框宽度 | string \| number | 50% |
| fullscreen | 是否全屏（固定全屏） | boolean | false |
| fullscreenIcon | 是否显示全屏切换图标 | boolean | false |
| visible | 是否显示（通常不需要手动设置） | boolean | false |
| props | 传递给内容渲染器的额外 props | any | - |
| hideFooter | 是否隐藏底部按钮区 | boolean | false |
| footerButtons | 自定义底部按钮配置 | Array\<ButtonProps\> | - |
| contentRenderer | 内容渲染函数 | Function | 必需 |
| headerRenderer | 自定义头部渲染函数 | Function | - |
| footerRenderer | 自定义底部渲染函数 | Function | - |
| openDelay | 打开延时（毫秒） | number | 0 |
| closeDelay | 关闭延时（毫秒） | number | 200 |
| sureBtnLoading | 确定按钮是否显示 loading | boolean | false |
| popconfirm | Popconfirm 配置 | Popconfirm | - |
| closeCallBack | 关闭回调 | Function | - |
| open | 打开回调 | Function | - |
| close | 关闭回调 | Function | - |
| beforeCancel | 取消前的回调 | Function | - |
| beforeSure | 确定前的回调 | Function | - |
| fullscreenCallBack | 全屏切换回调 | Function | - |

**DialogProps 继承自 Element Plus Dialog，支持所有原生属性，如：`top`、`modal`、`lockScroll`、`closeOnClickModal` 等。**

#### ButtonProps（自定义按钮配置）

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| label | 按钮文字 | string | 必需 |
| type | 按钮类型 | primary \| success \| warning \| danger \| info | - |
| text | 是否为文字按钮 | boolean | false |
| bg | 是否显示文字按钮背景 | boolean | false |
| btnClick | 按钮点击回调 | Function | - |
| popconfirm | Popconfirm 配置 | Popconfirm | - |

### closeDialog(options, index, args)

关闭对话框（通常不需要手动调用）。

### updateDialog(value, key, index)

更新对话框属性。

### closeAllDialog()

关闭所有对话框。

## 回调说明

### closeCallBack

关闭对话框时的回调，无论以何种方式关闭都会触发。

```typescript
closeCallBack: ({ options, index, args }) => {
  // args.command 可能的值：
  // "sure" - 点击确定按钮
  // "cancel" - 点击取消按钮
  // "close" - 点击右上角关闭或按 ESC
}
```

### beforeCancel

点击取消按钮前的回调，可以通过调用 `done` 参数控制是否真正关闭。

```typescript
beforeCancel: (done, { options, index }) => {
  // 执行一些操作
  if (confirm("确定取消吗？")) {
    done(); // 关闭对话框
  }
  // 不调用 done() 则不关闭
}
```

### beforeSure

点击确定按钮前的回调，可以通过调用 `done` 参数控制是否真正关闭。

```typescript
beforeSure: (done, { options, index, closeLoading }) => {
  // 提交数据
  submitData().then(() => {
    done(); // 关闭对话框
  }).catch(() => {
    closeLoading(); // 关闭 loading 状态
  });
}
```

## 注意事项

1. **必须引入组件**：在 `App.vue` 中必须引入 `<ReDialog />`，否则 `addDialog` 调用不会显示对话框。

2. **嵌套对话框**：嵌套使用时必须设置 `appendToBody: true`。

3. **contentRenderer 必需**：`contentRenderer` 是必需参数，定义了对话框的内容。

4. **默认按钮**：如果不指定 `footerButtons`，会显示默认的"取消"和"确定"按钮。

5. **全屏属性**：`fullscreen` 和 `fullscreenIcon` 同时传入时，只有 `fullscreen` 会生效。

6. **类型提示**：该组件基于 TypeScript 开发，提供了完整的类型定义，建议在 IDE 中启用类型提示。

## 更多文档

详细 API 文档请参考：
- [Element Plus Dialog](https://element-plus.org/zh-CN/component/dialog.html)
- [Element Plus Button](https://element-plus.org/zh-CN/component/button.html)
- [Element Plus Popconfirm](https://element-plus.org/zh-CN/component/popconfirm.html)

