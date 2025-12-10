Page({
  data: {
    mode: 'create', // create | view | edit
    isView: false,
    id: null,
    themeOptions: ['乡村振兴', '支教助学', '红色文化', '科技支农', '医疗卫生', '法律援助', '其他'],
    form: {
      title: '',
      theme: '',
      location: '',
      startDate: '',
      endDate: '',
      leader: '',
      phone: '',
      teacher: '',
      members: '',
      description: '',
      plan: '',
      expectedResult: ''
    },
    detail: null
  },

  onLoad(options) {
    const { mode = 'create', id } = options;
    this.setData({
      mode,
      isView: mode === 'view',
      id
    });

    if (mode === 'view' && id) {
      this.loadDetail(id);
    }

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: mode === 'create' ? '新建申报' : '申报详情'
    });
  },

  // 加载详情
  loadDetail(id) {
    // TODO: 替换为实际接口调用
    const mockDetail = {
      id: '1',
      title: '乡村振兴调研实践',
      theme: '乡村振兴',
      location: '湖南省长沙市',
      startDate: '2025-07-01',
      endDate: '2025-07-15',
      leader: '张三',
      phone: '13800138000',
      teacher: '李教授',
      members: '李四, 王五, 赵六, 钱七',
      description: '深入农村基层，调研乡村振兴战略实施情况，了解农村发展现状与需求。',
      plan: '第一周：走访调研\n第二周：数据整理与分析',
      expectedResult: '完成调研报告一份，提出建议方案',
      status: 'pending',
      statusText: '待审核'
    };
    this.setData({
      form: mockDetail,
      detail: mockDetail
    });
  },

  // 输入框变化
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  // 主题选择
  onThemeChange(e) {
    const index = e.detail.value;
    this.setData({
      'form.theme': this.data.themeOptions[index]
    });
  },

  // 开始日期
  onStartDateChange(e) {
    this.setData({
      'form.startDate': e.detail.value
    });
  },

  // 结束日期
  onEndDateChange(e) {
    this.setData({
      'form.endDate': e.detail.value
    });
  },

  // 表单验证
  validateForm() {
    const { form } = this.data;
    if (!form.title.trim()) {
      wx.showToast({ title: '请输入项目名称', icon: 'none' });
      return false;
    }
    if (!form.theme) {
      wx.showToast({ title: '请选择项目主题', icon: 'none' });
      return false;
    }
    if (!form.location.trim()) {
      wx.showToast({ title: '请输入实践地点', icon: 'none' });
      return false;
    }
    if (!form.startDate || !form.endDate) {
      wx.showToast({ title: '请选择实践时间', icon: 'none' });
      return false;
    }
    if (!form.leader.trim()) {
      wx.showToast({ title: '请输入负责人姓名', icon: 'none' });
      return false;
    }
    if (!form.phone.trim()) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' });
      return false;
    }
    if (!form.description.trim()) {
      wx.showToast({ title: '请输入项目简介', icon: 'none' });
      return false;
    }
    return true;
  },

  // 保存草稿
  saveDraft() {
    // TODO: 调用接口保存草稿
    wx.showToast({ title: '草稿已保存', icon: 'success' });
  },

  // 提交申报
  submitForm() {
    if (!this.validateForm()) return;

    wx.showModal({
      title: '确认提交',
      content: '提交后将进入审核流程，是否确认提交？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用接口提交
          wx.showToast({ title: '提交成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  }
});
