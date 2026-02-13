const app = getApp();
const { userApi, noticeApi } = require("../../utils/api");

Page({
  data: {
    isLogin: false,
    userInfo: {
      name: "未登录",
      roleName: "请先登录",
      avatarText: "?",
    },
    unreadCount: 0,
    menuItems: [],
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
  },

  // 检查登录状态
  checkLogin() {
    const isLogin = app.globalData.isLogin;
    if (isLogin) {
      const userInfo = app.globalData.userInfo;
      const menuItems = this.getMenuByRole(userInfo.role);
      this.setData({
        isLogin: true,
        userInfo: {
          name: userInfo.name,
          roleName: userInfo.roleName,
          avatarText: userInfo.name.slice(0, 1),
        },
        menuItems,
      });
      this.loadUnreadCount();
    } else {
      this.setData({
        isLogin: false,
        userInfo: {
          name: "未登录",
          roleName: "请先登录",
          avatarText: "?",
        },
        unreadCount: 0,
        menuItems: [],
      });
    }
  },

  // 加载未读消息数
  async loadUnreadCount() {
    try {
      const res = await noticeApi.getUnreadCount();
      this.setData({ unreadCount: res.count || 0 });
    } catch (err) {
      console.error("加载未读数失败:", err);
    }
  },

  // 根据角色获取菜单
  getMenuByRole(role) {
    const allMenus = [
      {
        key: "approve",
        name: "待审项目",
        url: "/pages/approve/list",
        icon: "icon-approve",
        roles: ["college_admin", "school_admin"],
      },
      {
        key: "evaluate",
        name: "待评项目",
        url: "/pages/evaluate/list",
        icon: "icon-evaluate",
        roles: ["expert", "school_admin"],
      },
      {
        key: "notice",
        name: "消息通知",
        url: "/pages/notice/list",
        icon: "icon-notice",
        roles: [
          "student",
          "teacher",
          "college_admin",
          "school_admin",
          "expert",
        ],
      },
    ];
    return allMenus.filter((m) => m.roles.includes(role));
  },

  // 跳转登录
  goLogin() {
    wx.navigateTo({
      url: "/pages/auth/login",
    });
  },

  // 跳转页面
  goToPage(e) {
    const url = e.currentTarget.dataset.url;
    const tabBarPages = [
      "/pages/index/index",
      "/pages/activity/apply-list",
      "/pages/progress/list",
      "/pages/profile/index",
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
      title: "关于系统",
      content:
        '大学生暑期"三下乡"活动管理系统\n版本：1.0.0\n\n本系统用于支持高校"三下乡"社会实践活动的数字化管理。',
      showCancel: false,
    });
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: "联系客服",
      content:
        "如有问题请联系：\n邮箱：service@example.com\n电话：400-123-4567",
      showCancel: false,
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: "确认退出",
      content: "确定要退出登录吗？",
      success: (res) => {
        if (res.confirm) {
          app.logout();
          this.setData({
            isLogin: false,
            userInfo: {
              name: "未登录",
              roleName: "请先登录",
              avatarText: "?",
            },
            unreadCount: 0,
            menuItems: [],
          });
          wx.showToast({ title: "已退出登录", icon: "success" });
        }
      },
    });
  },

  // 切换身份
  switchRole() {
    wx.showModal({
      title: "切换身份",
      content: "确定要切换到其他身份吗？",
      success: (res) => {
        if (res.confirm) {
          app.logout();
          wx.navigateTo({ url: "/pages/auth/login" });
        }
      },
    });
  },
});
