/**
 * 调试工具 - 用于开发和调试
 */

// 是否开启调试模式
const DEBUG_MODE = true;

// 调试日志
const debug = {
  log: (...args) => {
    if (DEBUG_MODE) {
      console.log("[DEBUG]", ...args);
    }
  },

  error: (...args) => {
    if (DEBUG_MODE) {
      console.error("[DEBUG ERROR]", ...args);
    }
  },

  warn: (...args) => {
    if (DEBUG_MODE) {
      console.warn("[DEBUG WARN]", ...args);
    }
  },

  // 网络请求调试
  request: (config) => {
    debug.log("请求开始:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.header,
    });
  },

  response: (response) => {
    debug.log("请求响应:", {
      status: response.statusCode,
      data: response.data,
    });
  },

  // 表单数据调试
  formData: (data, label = "表单数据") => {
    debug.log(label, data);
  },
};

// 检查网络连接
const checkNetwork = () => {
  wx.getNetworkType({
    success: (res) => {
      debug.log("网络类型:", res.networkType);
      if (res.networkType === "none") {
        wx.showToast({
          title: "网络连接不可用",
          icon: "none",
          duration: 3000,
        });
      }
    },
  });
};

// 检查服务器状态
const checkServer = async (url = "http://localhost:3000/api") => {
  try {
    const start = Date.now();
    const res = await new Promise((resolve, reject) => {
      wx.request({
        url: `${url}/health`,
        method: "GET",
        success: resolve,
        fail: reject,
        timeout: 5000,
      });
    });
    const end = Date.now();
    debug.log("服务器状态检查:", {
      status: res.statusCode,
      responseTime: `${end - start}ms`,
      available: res.statusCode === 200,
    });
    return res.statusCode === 200;
  } catch (err) {
    debug.error("服务器状态检查失败:", err);
    return false;
  }
};

module.exports = {
  debug,
  checkNetwork,
  checkServer,
  DEBUG_MODE,
};
