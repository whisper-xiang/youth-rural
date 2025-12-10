/**
 * 网络请求封装
 */

// API 基础地址
const BASE_URL = 'http://localhost:3000/api';

// 请求封装
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取 token
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        const { statusCode, data } = res;
        
        if (statusCode === 200) {
          if (data.code === 0) {
            resolve(data.data);
          } else if (data.code === 401) {
            // Token 过期，跳转登录
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            wx.showToast({ title: '请重新登录', icon: 'none' });
            setTimeout(() => {
              wx.navigateTo({ url: '/pages/auth/login' });
            }, 1500);
            reject(data);
          } else {
            wx.showToast({ title: data.message || '请求失败', icon: 'none' });
            reject(data);
          }
        } else {
          wx.showToast({ title: '网络错误', icon: 'none' });
          reject({ code: statusCode, message: '网络错误' });
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络连接失败', icon: 'none' });
        reject(err);
      }
    });
  });
};

// GET 请求
const get = (url, data) => request({ url, method: 'GET', data });

// POST 请求
const post = (url, data) => request({ url, method: 'POST', data });

// PUT 请求
const put = (url, data) => request({ url, method: 'PUT', data });

// DELETE 请求
const del = (url, data) => request({ url, method: 'DELETE', data });

// 上传文件
const upload = (filePath, formData = {}) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    wx.uploadFile({
      url: BASE_URL + '/upload/file',
      filePath,
      name: 'file',
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          resolve(data.data);
        } else {
          wx.showToast({ title: data.message || '上传失败', icon: 'none' });
          reject(data);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '上传失败', icon: 'none' });
        reject(err);
      }
    });
  });
};

// 上传图片
const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    wx.uploadFile({
      url: BASE_URL + '/upload/image',
      filePath,
      name: 'image',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          resolve(data.data.url);
        } else {
          reject(data);
        }
      },
      fail: reject
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
  uploadImage
};
