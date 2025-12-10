const app = getApp();

Page({
  data: {
    selectedRole: '',
    roles: {
      student: { name: '学生/团队负责人', mockName: '张三' },
      teacher: { name: '指导教师', mockName: '李教授' },
      college_admin: { name: '学院管理员', mockName: '王主任' },
      school_admin: { name: '校级管理员', mockName: '赵处长' },
      expert: { name: '评审专家', mockName: '陈教授' }
    }
  },

  onLoad() {
    // 如果已登录，直接跳转首页
    if (app.globalData.isLogin) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  // 选择角色
  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ selectedRole: role });
  },

  // 登录
  doLogin() {
    const { selectedRole, roles } = this.data;
    if (!selectedRole) {
      wx.showToast({ title: '请选择身份', icon: 'none' });
      return;
    }

    const roleInfo = roles[selectedRole];
    const userInfo = {
      name: roleInfo.mockName,
      role: selectedRole,
      roleName: roleInfo.name,
      college: '经济管理学院',
      phone: '13800138000'
    };

    // 保存用户信息
    app.setUserInfo(userInfo);

    wx.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 1000);
  }
});
