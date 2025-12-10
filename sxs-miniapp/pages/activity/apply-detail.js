const { projectApi, userApi } = require('../../utils/api');
const { uploadImage } = require('../../utils/request');

Page({
  data: {
    mode: 'create', // create | view | edit
    isView: false,
    id: null,
    themeOptions: ['乡村振兴', '支教助学', '红色文化', '科技支农', '医疗卫生', '法律援助', '其他'],
    teacherOptions: [],
    form: {
      title: '',
      theme: '',
      location: '',
      startDate: '',
      endDate: '',
      leader: '',
      phone: '',
      teacherId: '',
      teacher: '',
      members: '',
      description: '',
      plan: '',
      expectedResult: ''
    },
    detail: null,
    submitting: false
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
    } else {
      this.loadTeachers();
    }

    wx.setNavigationBarTitle({
      title: mode === 'create' ? '新建申报' : '申报详情'
    });
  },

  // 加载教师列表
  async loadTeachers() {
    try {
      const teachers = await userApi.getTeachers();
      this.setData({ teacherOptions: teachers });
    } catch (err) {
      console.error('加载教师列表失败:', err);
    }
  },

  // 加载详情
  async loadDetail(id) {
    try {
      const res = await projectApi.getDetail(id);
      const statusMap = {
        draft: '草稿', pending: '待审核', college_approved: '学院已审',
        approved: '已通过', rejected: '已驳回'
      };
      const detail = {
        ...res,
        startDate: res.start_date ? res.start_date.slice(0, 10) : '',
        endDate: res.end_date ? res.end_date.slice(0, 10) : '',
        statusText: statusMap[res.status] || res.status
      };
      this.setData({ form: detail, detail });
    } catch (err) {
      console.error('加载项目详情失败:', err);
    }
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
  async saveDraft() {
    if (this.data.submitting) return;
    this.setData({ submitting: true });

    try {
      const { form, id, mode } = this.data;
      const data = {
        title: form.title,
        theme: form.theme,
        location: form.location,
        start_date: form.startDate,
        end_date: form.endDate,
        leader: form.leader,
        phone: form.phone,
        teacher_id: form.teacherId,
        members: form.members,
        description: form.description,
        plan: form.plan,
        expected_result: form.expectedResult
      };

      if (mode === 'create') {
        await projectApi.create(data);
      } else {
        await projectApi.update(id, data);
      }

      wx.showToast({ title: '草稿已保存', icon: 'success' });
    } catch (err) {
      console.error('保存草稿失败:', err);
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 提交申报
  submitForm() {
    if (!this.validateForm()) return;

    wx.showModal({
      title: '确认提交',
      content: '提交后将进入审核流程，是否确认提交？',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ submitting: true });
          try {
            const { form, id, mode } = this.data;
            const data = {
              title: form.title,
              theme: form.theme,
              location: form.location,
              start_date: form.startDate,
              end_date: form.endDate,
              leader: form.leader,
              phone: form.phone,
              teacher_id: form.teacherId,
              members: form.members,
              description: form.description,
              plan: form.plan,
              expected_result: form.expectedResult
            };

            let projectId = id;
            if (mode === 'create') {
              const createRes = await projectApi.create(data);
              projectId = createRes.id;
            } else {
              await projectApi.update(id, data);
            }

            // 提交审批
            await projectApi.submit(projectId);

            wx.showToast({ title: '提交成功', icon: 'success' });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } catch (err) {
            console.error('提交失败:', err);
          } finally {
            this.setData({ submitting: false });
          }
        }
      }
    });
  }
});
