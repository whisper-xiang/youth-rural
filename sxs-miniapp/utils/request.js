/**
 * 网络请求封装 - 支持类似axios拦截器功能
 */

const { debug } = require("./debug");

// API 基础地址
const BASE_URL = "http://localhost:3000/api";

// 请求拦截器
const requestInterceptors = [];
const responseInterceptors = [];

// 添加请求拦截器
const addRequestInterceptor = (interceptor) => {
  requestInterceptors.push(interceptor);
};

// 添加响应拦截器
const addResponseInterceptor = (interceptor) => {
  responseInterceptors.push(interceptor);
};

// 默认请求拦截器 - 添加token
addRequestInterceptor((config) => {
  const token = wx.getStorageSync("token");
  if (token) {
    config.header = {
      ...config.header,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// 默认响应拦截器 - 处理token过期
addResponseInterceptor((response) => {
  const { statusCode, data } = response;

  // 处理token过期 (业务码 401 或 HTTP 状态码 401)
  if ((statusCode === 200 && data.code === 401) || statusCode === 401) {
    // 清除本地存储
    wx.removeStorageSync("token");
    wx.removeStorageSync("userInfo");

    // 更新全局状态
    const app = getApp();
    if (app && app.logout) {
      app.logout();
    }

    // 显示提示并跳转登录
    wx.showToast({ title: "登录已过期，请重新登录", icon: "none" });
    setTimeout(() => {
      // 使用 reLaunch 确保清除所有页面栈并进入登录页
      wx.reLaunch({ url: "/pages/auth/login" });
    }, 1500);

    return Promise.reject(data);
  }

  return response;
});

// 请求封装
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 执行请求拦截器
    let config = {
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "Content-Type": "application/json",
        ...options.header,
      },
    };

    // 应用所有请求拦截器
    for (const interceptor of requestInterceptors) {
      try {
        config = interceptor(config) || config;
      } catch (error) {
        console.error("请求拦截器执行失败:", error);
        return reject(error);
      }
    }

    // 调试日志
    debug.request(config);

    wx.request({
      ...config,
      success: (res) => {
        // 调试日志
        debug.response(res);

        // 执行响应拦截器
        let response = res;
        try {
          for (const interceptor of responseInterceptors) {
            response = interceptor(response) || response;
            // 如果拦截器返回了 Promise.reject 或 throw 了错误，需要在此处理
            // 但目前的拦截器实现是直接返回 Promise.reject
          }
        } catch (error) {
          return reject(error);
        }

        // 如果拦截器处理后返回的是一个被拒绝的 Promise（如 401 处理）
        if (response instanceof Promise) {
          return response.then(resolve).catch(reject);
        }

        const { statusCode, data } = response;

        if (statusCode === 200) {
          if (data.code === 0) {
            resolve(data.data);
          } else {
            wx.showToast({ title: data.message || "请求失败", icon: "none" });
            reject(data);
          }
        } else if (statusCode >= 500) {
          // 服务器内部错误
          const errorMessage = data?.message || `服务器错误(${statusCode})`;
          console.error("服务器错误:", statusCode, data);
          wx.showToast({ title: errorMessage, icon: "none", duration: 3000 });
          reject({ code: statusCode, message: errorMessage, data });
        } else if (statusCode === 400) {
          // 客户端请求错误
          const errorMessage = data?.message || "请求参数错误";
          console.error("请求错误:", statusCode, data);
          wx.showToast({ title: errorMessage, icon: "none" });
          reject({ code: statusCode, message: errorMessage, data });
        } else if (statusCode === 403) {
          // 权限错误
          const errorMessage = data?.message || "无权限访问";
          console.error("权限错误:", statusCode, data);
          wx.showToast({ title: errorMessage, icon: "none" });
          reject({ code: statusCode, message: errorMessage, data });
        } else {
          // 其他HTTP错误
          const errorMessage = data?.message || `请求失败(${statusCode})`;
          console.error("HTTP错误:", statusCode, data);
          wx.showToast({ title: errorMessage, icon: "none" });
          reject({ code: statusCode, message: errorMessage, data });
        }
      },
      fail: (err) => {
        debug.error("网络请求失败:", err);
        wx.showToast({ title: "网络连接失败", icon: "none" });
        reject(err);
      },
    });
  });
};

// GET 请求
const get = (url, data) => request({ url, method: "GET", data });

// POST 请求
const post = (url, data) => request({ url, method: "POST", data });

// PUT 请求
const put = (url, data) => request({ url, method: "PUT", data });

// DELETE 请求
const del = (url, data) => request({ url, method: "DELETE", data });

// 上传文件
const upload = (filePath, formData = {}) => {
  return new Promise((resolve, reject) => {
    // 应用请求拦截器
    let config = {
      url: BASE_URL + "/upload/file",
      filePath,
      name: "file",
      formData,
      header: {},
    };

    // 应用请求拦截器
    for (const interceptor of requestInterceptors) {
      try {
        config = interceptor(config) || config;
      } catch (error) {
        console.error("上传请求拦截器执行失败:", error);
        return reject(error);
      }
    }

    wx.uploadFile({
      ...config,
      success: (res) => {
        // 应用响应拦截器
        let response = res;
        try {
          for (const interceptor of responseInterceptors) {
            response = interceptor(response) || response;
          }
        } catch (error) {
          return reject(error);
        }

        // 如果拦截器处理后返回的是一个被拒绝的 Promise
        if (response instanceof Promise) {
          return response.then(resolve).catch(reject);
        }

        const data = JSON.parse(response.data);
        if (data.code === 0) {
          resolve(data.data);
        } else {
          wx.showToast({ title: data.message || "上传失败", icon: "none" });
          reject(data);
        }
      },
      fail: (err) => {
        wx.showToast({ title: "上传失败", icon: "none" });
        reject(err);
      },
    });
  });
};

// 上传图片
const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    // 应用请求拦截器
    let config = {
      url: BASE_URL + "/upload/image",
      filePath,
      name: "image",
      header: {},
    };

    // 应用请求拦截器
    for (const interceptor of requestInterceptors) {
      try {
        config = interceptor(config) || config;
      } catch (error) {
        console.error("图片上传请求拦截器执行失败:", error);
        return reject(error);
      }
    }

    wx.uploadFile({
      ...config,
      success: (res) => {
        // 应用响应拦截器
        let response = res;
        for (const interceptor of responseInterceptors) {
          try {
            response = interceptor(response) || response;
          } catch (error) {
            console.error("图片上传响应拦截器执行失败:", error);
            return reject(error);
          }
        }

        const data = JSON.parse(response.data);
        if (data.code === 0) {
          resolve(data.data.url);
        } else {
          reject(data);
        }
      },
      fail: reject,
    });
  });
};

module.exports = {
  BASE_URL,
  request,
  get,
  post,
  put,
  del,
  upload,
  uploadImage,
  addRequestInterceptor,
  addResponseInterceptor,
};
