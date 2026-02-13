// 首页：功能模块导航入口
const app = getApp();
const { userApi } = require("../../utils/api");

Page({
  data: {
    isLogin: false,
    isStudent: false,
    modules: [],
    projects: [], // 学生端项目列表
    showProcessModal: false, // 控制流程弹窗显示
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
  },

  // 检查登录状态并加载模块
  checkLogin() {
    const app = getApp();
    console.log("checkLogin被调用, app.globalData:", app.globalData);

    if (app && app.globalData && app.globalData.isLogin) {
      const isStudent = app.globalData.role === "student";

      console.log("用户已登录, isStudent:", isStudent);

      const modules = app.getRoleModules();
      this.setData({
        isLogin: true,
        isStudent,
        modules,
      });
    } else {
      console.log("用户未登录");
      this.setData({
        isLogin: false,
        isStudent: false,
        modules: [],
        projects: [],
      });
    }
  },

  // 跳转登录
  goLogin() {
    console.log("goLogin被调用");
    const app = getApp();

    // 如果已登录，先退出登录再跳转
    if (app.globalData && app.globalData.isLogin) {
      console.log("用户已登录，先退出登录");
      app.logout();
    }

    wx.navigateTo({
      url: "/pages/auth/login?force=1",
      success: () => {
        console.log("登录页面跳转成功");
      },
      fail: (err) => {
        console.error("登录页面跳转失败:", err);
        wx.showToast({
          title: "页面跳转失败",
          icon: "none",
        });
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
      "/pages/notice/list",
      "/pages/profile/index",
    ];
    if (tabBarPages.includes(url)) {
      wx.switchTab({ url });
    } else {
      wx.navigateTo({ url });
    }
  },

  // 跳转到项目详情/工作台
  goToProject(e) {
    const projectId = e.currentTarget.dataset.id;
    // 从数据中查找对应的项目状态
    const project = this.data.projects.find((p) => p.id === projectId);
    const status = project ? project.status : "";

    // 如果项目已立项（APPROVED / CLOSED 等），进入工作台
    if (["APPROVED", "CLOSED"].includes(status)) {
      wx.navigateTo({
        url: `/pages/project/workspace?id=${projectId}`,
      });
    } else {
      // 否则进入申请详情页
      wx.navigateTo({
        url: `/pages/activity/apply-detail?id=${projectId}&mode=view`,
      });
    }
  },

  // 跳转到申报页面
  goToApply() {
    wx.navigateTo({
      url: "/pages/activity/apply-detail?mode=create",
    });
  },

  // 显示流程指引
  showProcessGuide() {
    this.setData({
      showProcessModal: true,
    });
  },

  // 隐藏流程指引
  hideProcessGuide() {
    this.setData({
      showProcessModal: false,
    });
  },
});
