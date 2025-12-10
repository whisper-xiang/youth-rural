Page({
  data: {
    isLogin: false,
    userInfo: {
      name: '未登录',
      roleName: '请先登录',
      avatarText: '?'
    },
    stats: {
      applyCount: 0,
      progressCount: 0,
      resultCount: 0
    },
    unreadCount: 0
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
  },

  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.name) {
      // 模拟数据
      this.setData({
        isLogin: true,
        userInfo: {
          name: userInfo.name || '张三',
          roleName: userInfo.roleName || '团队负责人',
          avatarText: (userInfo.name || '张').slice(0, 1)
        },
        stats: {
          applyCount: 3,
          progressCount: 5,
          resultCount: 2
        },
        unreadCount: 2
      });
    } else {
      // 模拟已登录状态（演示用）
      this.setData({
        isLogin: true,
        userInfo: {
          name: '张三',
          roleName: '团队负责人',
          avatarText: '张'
        },
        stats: {
          applyCount: 3,
          progressCount: 5,
          resultCount: 2
        },
        unreadCount: 2
      });
    }
  },

  // 跳转登录
  goLogin() {
    wx.navigateTo({
      url: '/pages/auth/login'
    });
  },

  // 跳转页面
  goToPage(e) {
    const url = e.currentTarget.dataset.url;
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
  },

  // 关于系统
  showAbout() {
    wx.showModal({
      title: '关于系统',
      content: '大学生暑期"三下乡"活动管理系统\n版本：1.0.0\n\n本系统用于支持高校"三下乡"社会实践活动的数字化管理。',
      showCancel: false
    });
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '如有问题请联系：\n邮箱：service@example.com\n电话：400-123-4567',
      showCancel: false
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          this.setData({
            isLogin: false,
            userInfo: {
              name: '未登录',
              roleName: '请先登录',
              avatarText: '?'
            },
            stats: {
              applyCount: 0,
              progressCount: 0,
              resultCount: 0
            },
            unreadCount: 0
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  }
});
