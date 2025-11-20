import { onBeforeUnmount, ref } from "vue";
import { websocketData } from "./websocketdata";

/**
 * WebSocket 连接管理
 * 提供WebSocket连接、重连、关闭等功能
 * @param options 配置选项
 * @param options.wsUrl WebSocket服务器地址
 * @param options.onMessage 消息接收回调函数
 * @param options.onConnected 连接成功回调函数
 * @returns 返回WebSocket实例和操作方法
 */
const useWebSocket = function (options?: { onMessage?: (message: any) => void; wsUrl: string; onConnected?: () => void }) {
  const ws = ref<WebSocket | null>(null);

  // 重连配置
  const maxAttempts = 5; // 最大重连次数
  const baseDelay = 1000; // 基础延迟时间（毫秒）
  const maxDelay = 16000; // 最大延迟时间（毫秒）

  // 重连状态管理
  const reconnectAttempts = ref<number>(0); // 当前重连尝试次数
  const reconnectTimer = ref<number | null>(null); // 重连定时器ID
  const isManualClose = ref<boolean>(false); // 是否手动关闭连接

  /**
   * 清除重连定时器
   */
  const clearReconnectTimer = function () {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value);
      reconnectTimer.value = null;
    }
  };

  /**
   * 尝试重连WebSocket连接
   */
  const attemptReconnect = function () {
    // 清除之前的重连定时器
    clearReconnectTimer();

    // 如果是手动关闭，不进行重连
    if (isManualClose.value) {
      return;
    }

    // 检查是否超过最大重连次数
    if (reconnectAttempts.value >= maxAttempts) {
      console.error(`达到最大重连次数 (${maxAttempts})，停止重连`);
      return;
    }

    reconnectAttempts.value++;

    // 指数退避：重连间隔逐渐增加
    const delay = Math.min(baseDelay * 2 ** (reconnectAttempts.value - 1), maxDelay);

    console.warn(`正在重连... (第 ${reconnectAttempts.value}/${maxAttempts} 次，${delay}ms 后)`);

    // 延迟后执行重连
    reconnectTimer.value = window.setTimeout(() => {
      if (!isManualClose.value) {
        connectWebSocket();
      }
    }, delay);
  };

  /**
   * 重置重连状态（连接成功时调用）
   */
  const resetReconnect = function () {
    reconnectAttempts.value = 0;
    clearReconnectTimer();
    console.log("重置重连状态成功");
  };

  /**
   * 清理资源
   */
  const cleanup = function () {
    clearReconnectTimer();
    reconnectAttempts.value = 0;
    isManualClose.value = false;
  };

  /**
   * 建立WebSocket连接
   * 创建WebSocket实例并设置事件处理器，支持自动重连
   */
  const connectWebSocket = function () {
    const wsUrl = options.wsUrl;

    // 如果已有连接，先关闭
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }

    ws.value = new WebSocket(wsUrl);

    // 连接打开事件
    ws.value.onopen = function () {
      resetReconnect();

      // 触发连接成功回调
      if (options?.onConnected) {
        options.onConnected();
      }
    };

    // 接收消息事件
    ws.value.onmessage = function (event) {
      try {
        if (event.data.includes("Request served by")) {
          return;
        }
        const message = JSON.parse(event.data);
        if (message.page === 1) {
          const data = {
            data: websocketData.data.slice(0, 10),
            page: 1,
            pageSize: websocketData.pageSize,
            total: websocketData.total
          };
          options.onMessage(data);
        } else {
          const data = {
            data: websocketData.data.slice(10),
            page: 2,
            pageSize: websocketData.pageSize,
            total: websocketData.total
          };
          options.onMessage(data);
        }
      } catch (error) {
        console.error("解析WebSocket消息失败:", error);
      }
    };

    // 连接错误事件
    ws.value.onerror = function (error) {
      console.error("WebSocket连接错误:", error);
      // 错误事件后通常会触发 onclose，在 onclose 中处理重连
    };

    // 连接关闭事件
    ws.value.onclose = function (event) {
      // 如果不是正常关闭（code !== 1000），尝试重连
      if (event.code !== 1000 && !isManualClose.value) {
        attemptReconnect();
      }
    };
  };

  /**
   * 发送消息到WebSocket服务器
   * @param message 要发送的消息（可以是字符串或对象，对象会自动转换为JSON）
   */
  const sendMessage = function (message: string | object) {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket未连接，无法发送消息");
      return false;
    }

    try {
      const messageStr = typeof message === "string" ? message : JSON.stringify(message);
      ws.value.send(messageStr);
      return true;
    } catch (error) {
      console.error("发送WebSocket消息失败:", error);
      return false;
    }
  };

  /**
   * 关闭WebSocket连接
   * 设置手动关闭标志，避免触发自动重连
   */
  const closeWebSocket = function () {
    isManualClose.value = true;
    clearReconnectTimer();

    if (ws.value) {
      if (ws.value.readyState === WebSocket.OPEN) {
        console.log("正常关闭");
        ws.value.close(1000, "正常关闭");
      }
      ws.value = null;
    }
  };

  // 组件卸载时自动关闭
  onBeforeUnmount(() => {
    closeWebSocket();
    cleanup();
  });

  return {
    connectWebSocket,
    sendMessage,
    closeWebSocket
  };
};

export default useWebSocket;
