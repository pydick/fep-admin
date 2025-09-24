export default {
  ws: {},
  func_dict: {
    task_state: undefined,
    task_card: undefined,
    taskCenter: undefined,
    qsar_results_test: undefined
  },

  setWs: function () {
    const base_url = window.location.host;
    const web_socket_url = "ws://" + base_url + "/ws/subscribe";
    const ws = new WebSocket(web_socket_url);
    ws.onopen = () => {
      console.log("WebSocket 开始连接");
    };
    ws.onclose = () => {
      console.log("连接已关闭...");
    };
    ws.onmessage = e => {
      for (const key in this.func_dict) {
        if (this.func_dict[key]) {
          this.func_dict[key](e);
        }
      }
    };
    this.ws = ws;
  },
  setFunc: function (name, func) {
    this.func_dict[name] = func;
  },
  reconnect: function () {
    try {
      this.ws.close();
    } catch (err) {
      console.log(err);
    }
    this.setWs();
  }
};
