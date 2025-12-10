// 首页：功能模块导航入口
Page({
  data: {
    userInfo: {
      name: '未登录',
      role: '请先登录',
      avatarText: '?'
    }
  },

  onLoad() {
    // TODO: 从本地存储或接口获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.name) {
      this.setData({
        userInfo: {
          name: userInfo.name,
          role: userInfo.role || '普通用户',
          avatarText: userInfo.name.slice(0, 1)
        }
      });
    }
  },

  // 跳转到对应页面
  goToPage(e) {
    const url = e.currentTarget.dataset.url;
    // tabBar 页面用 switchTab，其他用 navigateTo
    const tabBarPages = [
      '/pages/index/index',
      '/pages/activity/apply-list',
      '/pages/progress/list',
      '/pages/profile/index'
    ];
    if (tabBarPages.includes(url)) {
      wx.switchTab({ url });
    } else {
      wx.navigateTo({ url });
    }
  }
});
