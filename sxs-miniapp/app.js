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
      "result.view": ["student", "teacher", "college_admin", "school_admin"],
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
        key: "create",
        name: "项目申报",
        desc: "发起新的社会实践项目申请",
        url: "/pages/activity/apply-detail?mode=create",
        icon: "icon-create",
      },
      {
        key: "apply",
        name: "我的项目",
        desc: "跟踪申报进度与项目管理",
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
        key: "result",
        name: "成果汇总",
        desc: "查阅和管理活动实践成果",
        url: "/pages/result/list",
        icon: "icon-result",
      },
      {
        key: "evaluate",
        name: "项目评审",
        desc: "对申报项目进行打分与评价",
        url: "/pages/evaluate/list",
        icon: "icon-evaluate",
      },
      {
        key: "ranking",
        name: "评优榜单",
        desc: "查看优秀项目公示结果",
        url: "/pages/evaluate/ranking",
        icon: "icon-ranking",
      },
      {
        key: "notice",
        name: "消息公告",
        desc: "查阅系统通知与活动资讯",
        url: "/pages/notice/list",
        icon: "icon-notice",
      },
      {
        key: "notice_manage",
        name: "通知发布",
        desc: "发布和管理系统公告",
        url: "/pages/notice/create",
        icon: "icon-notice-manage",
      },
    ];

    const roleModules = {
      student: ["create", "apply", "notice", "ranking"],
      teacher: ["apply", "result", "notice", "ranking"],
      college_admin: ["approve", "notice_manage", "ranking"],
      school_admin: ["approve", "evaluate", "notice_manage", "ranking"],
      expert: ["evaluate", "notice", "ranking"],
    };

    const allowedKeys = roleModules[role] || [];
    return allModules.filter((m) => allowedKeys.includes(m.key));
  },
});
