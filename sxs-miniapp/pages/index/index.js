// 首页：功能模块导航入口
const app = getApp();
const { userApi } = require("../../utils/api");

Page({
  data: {
    isLogin: false,
    userInfo: {
      name: "",
      roleName: "",
      avatarText: "",
    },
    modules: [],
    stats: {
      projectCount: 0,
      pendingCount: 0,
      noticeCount: 0,
    },
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
  },

  // 检查登录状态并加载模块
  checkLogin() {
    const isLogin = app.globalData.isLogin;
    if (isLogin) {
      const userInfo = app.globalData.userInfo;
      const modules = app.getRoleModules();
      this.setData({
        isLogin: true,
        userInfo: {
          name: userInfo.name,
          roleName: userInfo.roleName,
          avatarText: userInfo.name.slice(0, 1),
        },
        modules,
      });
      // 加载统计数据
      this.loadStats();
    } else {
      this.setData({
        isLogin: false,
        userInfo: { name: "", roleName: "", avatarText: "" },
        modules: [],
        stats: { projectCount: 0, pendingCount: 0, noticeCount: 0 },
      });
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const stats = await userApi.getStats();
      this.setData({ stats });
    } catch (err) {
      console.error("获取统计数据失败:", err);
    }
  },

  // 跳转登录
  goLogin() {
    wx.navigateTo({ url: "/pages/auth/login" });
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

  // 跳转到对应页面
  goToPage(e) {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: "/pages/auth/login" });
      return;
    }

    const url = e.currentTarget.dataset.url;
    // tabBar 页面用 switchTab，其他用 navigateTo
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

  // 跳转到统计页面
  goToStats(e) {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: "/pages/auth/login" });
      return;
    }

    const type = e.currentTarget.dataset.type;
    const role = app.globalData.role;
    let url = "";

    switch (type) {
      case "project":
        // 根据角色跳转到不同的项目页面
        if (role === "student" || role === "teacher") {
          url = "/pages/activity/apply-list";
        } else if (role === "college_admin" || role === "school_admin") {
          url = "/pages/approve/list";
        } else {
          url = "/pages/activity/apply-list";
        }
        break;

      case "pending":
        // 根据角色跳转到待处理页面
        if (role === "college_admin") {
          url = "/pages/approve/list";
        } else if (role === "school_admin") {
          url = "/pages/approve/list";
        } else if (role === "teacher") {
          url = "/pages/progress/list";
        } else if (role === "expert") {
          url = "/pages/evaluate/list";
        } else {
          url = "/pages/activity/apply-list";
        }
        break;

      case "notice":
        // 通知页面
        url = "/pages/notice/list";
        break;

      default:
        url = "/pages/activity/apply-list";
        break;
    }

    // tabBar 页面用 switchTab，其他用 navigateTo
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
});
