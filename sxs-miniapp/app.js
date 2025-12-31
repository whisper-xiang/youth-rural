// 三下乡活动管理小程序入口文件
App({
  globalData: {
    userInfo: null,
    // 角色类型: student(学生/团队负责人), teacher(指导教师), college_admin(学院管理员), school_admin(校级管理员), expert(评审专家)
    role: null,
    roleName: "",
    isLogin: false,
  },

  onLaunch() {
    // 检查本地存储的登录信息
    const token = wx.getStorageSync("token");
    const userInfo = wx.getStorageSync("userInfo");
    if (token && userInfo && userInfo.role) {
      this.globalData.userInfo = userInfo;
      this.globalData.role = userInfo.role;
      this.globalData.roleName = userInfo.roleName;
      this.globalData.isLogin = true;
    }
    console.log("sxs-miniapp onLaunch");
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.role = userInfo.role;
    this.globalData.roleName = userInfo.roleName;
    this.globalData.isLogin = true;
    wx.setStorageSync("userInfo", userInfo);
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null;
    this.globalData.role = null;
    this.globalData.roleName = "";
    this.globalData.isLogin = false;
    wx.removeStorageSync("userInfo");
    wx.removeStorageSync("token");
  },

  // 检查是否有某个权限
  hasPermission(permission) {
    const role = this.globalData.role;
    const permissions = {
      // 活动申报
      "apply.create": ["student"],
      "apply.view": ["student", "teacher", "college_admin", "school_admin"],
      "project.close": ["teacher"],
      // 审批管理
      "approve.college": ["college_admin"],
      "approve.school": ["school_admin"],
      "approve.view": ["college_admin", "school_admin"],
      // 进度跟踪
      "progress.upload": ["student"],
      "progress.comment": ["teacher"],
      "progress.view": ["student", "teacher", "college_admin", "school_admin"],
      // 成果管理
      "result.submit": ["student"],
      "result.view": [
        "student",
        "teacher",
        "college_admin",
        "school_admin",
        "expert",
      ],
      // 评优管理
      "evaluate.score": ["expert"],
      "evaluate.manage": ["school_admin"],
      "evaluate.view": ["expert", "school_admin"],
      // 通知公告
      "notice.publish": ["college_admin", "school_admin"],
      "notice.view": [
        "student",
        "teacher",
        "college_admin",
        "school_admin",
        "expert",
      ],
    };
    return permissions[permission] && permissions[permission].includes(role);
  },

  // 获取角色对应的首页模块
  getRoleModules() {
    const role = this.globalData.role;
    const allModules = [
      {
        key: "apply",
        name: "项目管理",
        desc: "创建和管理申报项目",
        url: "/pages/activity/apply-list",
        icon: "icon-apply",
      },
      {
        key: "approve",
        name: "审批管理",
        desc: "审核项目申报材料",
        url: "/pages/approve/list",
        icon: "icon-approve",
      },
      {
        key: "progress",
        name: "进度跟踪",
        desc: "上传和查看活动进展",
        url: "/pages/progress/list",
        icon: "icon-progress",
      },
      {
        key: "result",
        name: "成果管理",
        desc: "提交和浏览活动成果",
        url: "/pages/result/list",
        icon: "icon-result",
      },
      {
        key: "evaluate",
        name: "评优管理",
        desc: "项目评审与打分",
        url: "/pages/evaluate/list",
        icon: "icon-evaluate",
      },
      {
        key: "notice",
        name: "通知公告",
        desc: "查看最新通知",
        url: "/pages/notice/list",
        icon: "icon-notice",
      },
    ];

    const roleModules = {
      student: ["apply", "progress", "result", "notice"],
      teacher: ["apply", "progress", "result", "notice"],
      college_admin: ["apply", "approve", "progress", "result", "notice"],
      school_admin: [
        "apply",
        "approve",
        "progress",
        "result",
        "evaluate",
        "notice",
      ],
      expert: ["result", "evaluate", "notice"],
    };

    const allowedKeys = roleModules[role] || [];
    return allModules.filter((m) => allowedKeys.includes(m.key));
  },
});
