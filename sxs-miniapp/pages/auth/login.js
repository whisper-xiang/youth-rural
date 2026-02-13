const app = getApp();
const { authApi } = require("../../utils/api");

Page({
  data: {
    selectedRole: "",
    // 测试账号对应关系
    testAccounts: {
      student: { username: "2021001", password: "123456" },
      teacher: { username: "t_wang", password: "123456" },
      college_admin: { username: "ca_jg", password: "123456" },
      school_admin: { username: "admin", password: "123456" },
      expert: { username: "e_chen", password: "123456" },
    },
    loading: false,
  },

  onLoad(options) {
    console.log("登录页面onLoad被调用, options:", options);
    // 如果已登录且不是主动重新登录，直接跳转首页
    if (app.globalData && app.globalData.isLogin && !options.force) {
      console.log("用户已登录，跳转首页");
      wx.switchTab({ url: "/pages/index/index" });
    } else {
      console.log("显示登录页面");
    }
  },

  // 选择角色
  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ selectedRole: role });
  },

  // 登录
  async doLogin() {
    const { selectedRole, testAccounts, loading } = this.data;

    if (loading) return;

    if (!selectedRole) {
      wx.showToast({ title: "请选择身份", icon: "none" });
      return;
    }

    const account = testAccounts[selectedRole];
    this.setData({ loading: true });

    try {
      // 调用登录接口
      const res = await authApi.login({
        username: account.username,
        password: account.password,
      });

      // 保存 token
      wx.setStorageSync("token", res.token);

      // 保存用户信息到全局
      app.setUserInfo(res.userInfo);

      wx.showToast({ title: "登录成功", icon: "success" });
      setTimeout(() => {
        wx.switchTab({ url: "/pages/index/index" });
      }, 1000);
    } catch (err) {
      console.error("登录失败:", err);
    } finally {
      this.setData({ loading: false });
    }
  },
});
