# 工具函数使用说明

## 网络请求拦截器

现在项目支持类似axios的拦截器机制，可以统一处理请求和响应。

### 基本使用

```javascript
const { get, post, addRequestInterceptor, addResponseInterceptor } = require('./request');

// 基本请求
const data = await get('/user/info');
const result = await post('/project/create', projectData);
```

### 添加自定义拦截器

#### 请求拦截器
```javascript
const { addRequestInterceptor } = require('./request');

// 添加请求拦截器
addRequestInterceptor((config) => {
  // 可以在这里修改请求配置
  console.log('发送请求:', config.url);
  
  // 添加自定义header
  config.header['X-Custom-Header'] = 'custom-value';
  
  return config;
});
```

#### 响应拦截器
```javascript
const { addResponseInterceptor } = require('./request');

// 添加响应拦截器
addResponseInterceptor((response) => {
  // 可以在这里处理响应数据
  console.log('收到响应:', response.statusCode);
  
  // 统一处理特定状态码
  if (response.statusCode === 403) {
    wx.showToast({ title: '无权限访问', icon: 'none' });
  }
  
  return response;
});
```

### 内置拦截器

项目已内置以下拦截器：

1. **请求拦截器**: 自动添加Authorization token
2. **响应拦截器**: 处理token过期，自动跳转登录页

### 登录校验机制

现在不需要在每个页面手动检查登录状态，拦截器会自动处理：

- **Token过期**: 自动清除本地存储，跳转登录页
- **未登录请求**: 网络请求会失败，显示相应错误信息

### 页面权限检查

对于需要特定权限的页面，仍然需要手动检查：

```javascript
const app = getApp();

onLoad() {
  // 检查权限
  if (!app.hasPermission('apply.create')) {
    wx.showToast({ title: '无权限操作', icon: 'none' });
    return;
  }
  
  // 加载数据
  this.loadData();
}
```

## 优势

1. **统一处理**: 所有请求都会经过拦截器
2. **自动token管理**: 无需手动添加Authorization header
3. **自动登录检查**: token过期自动跳转登录
4. **可扩展**: 可以添加自定义拦截器
5. **减少重复代码**: 页面无需重复的登录检查逻辑

## 注意事项

1. 拦截器按添加顺序执行
2. 拦截器中出错会中断请求
3. 上传文件也支持拦截器
4. 使用`wx.redirectTo`而不是`wx.navigateTo`跳转登录，防止返回问题
