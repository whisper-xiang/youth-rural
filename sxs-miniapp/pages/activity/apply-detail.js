const { projectApi, resultApi, userApi } = require("../../utils/api");
const { debug } = require("../../utils/debug");
const { uploadImage } = require("../../utils/request");

Page({
  data: {
    mode: "create", // create | view | edit
    isView: false,
    id: null,
    themeOptions: [
      "乡村振兴",
      "支教助学",
      "红色文化",
      "科技支农",
      "医疗卫生",
      "法律援助",
      "其他",
    ],
    teacherOptions: [],
    form: {
      title: "",
      theme: "",
      location: "",
      startDate: "",
      endDate: "",
      budget: "",
      leader: "",
      phone: "",
      teacherId: "",
      teacher: "",
      members: "",
      description: "",
      plan: "",
      expectedResult: "",
    },
    detail: null,
    resultCount: 0,
    canSubmitResult: false,
    canUploadProgress: false,
    canCloseProject: false,
    submitting: false,
  },

  onLoad(options) {
    const { mode = "create", id } = options;

    const app = getApp();
    const canSubmitResult = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("result.submit")
    );
    const canUploadProgress = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("progress.upload")
    );
    const canCloseProject = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("project.close")
    );

    this.setData({
      mode,
      isView: mode === "view",
      id,
      canSubmitResult,
      canUploadProgress,
      canCloseProject,
    });

    // view / edit 模式：需要回显项目详情；同时加载教师列表以便展示/选择
    if (id && mode !== "create") {
      this.loadTeachers();
      this.loadDetail(id);
    } else {
      this.loadTeachers();
    }

    wx.setNavigationBarTitle({
      title:
        mode === "create"
          ? "新建申报"
          : mode === "edit"
            ? "编辑申报"
            : "申报详情",
    });
  },

  // 加载教师列表
  async loadTeachers() {
    try {
      // 先获取用户信息以获取学院ID
      const userInfo = await userApi.getInfo();
      const teachers = await userApi.getTeachers(userInfo.collegeId);
      this.setData({ teacherOptions: teachers });
    } catch (err) {
      console.error("加载教师列表失败:", err);
      // 如果获取失败，设置为空数组
      this.setData({ teacherOptions: [] });
    }
  },

  // 加载详情
  async loadDetail(id) {
    try {
      const res = await projectApi.getDetail(id);
      debug.log("加载项目详情原始数据:", res);

      const statusMap = {
        pending: "待学院审核",
        college_approved: "待校级审核",
        school_approved: "审核通过",
        approved: "审核通过",
        closed: "已结项",
        rejected: "已驳回",
      };
      const detail = {
        ...res,
        startDate: res.start_date ? res.start_date.slice(0, 10) : "",
        endDate: res.end_date ? res.end_date.slice(0, 10) : "",
        statusText: statusMap[res.status] || res.status,
        // 映射字段名
        theme: res.category,
        themeIndex:
          this.data.themeOptions.indexOf(res.category) >= 0
            ? this.data.themeOptions.indexOf(res.category)
            : 0,
        location: res.target_area,
        budget: res.budget ? res.budget.toString() : "",
        leader: res.leader_name,
        phone: res.leader_phone,
        teacherId: res.teacher_id,
        teacher: res.teacher_name,
        description: res.description,
        // 团队成员从members数组中提取姓名
        members:
          res.members && res.members.length > 0
            ? res.members
                .filter((m) => m.role === "member")
                .map((m) => m.name)
                .join("、")
            : "",
        // 这些字段在数据库中可能不存在，使用默认值
        plan: res.plan || "",
        expectedResult: res.expected_result || "",
      };

      debug.log("处理后的详情数据:", detail);
      debug.formData(detail, "设置到表单的数据");

      this.setData({ form: detail, detail });

      // 验证日期字段是否正确设置
      debug.log("表单日期字段 - 开始日期:", this.data.form.startDate);
      debug.log("表单日期字段 - 结束日期:", this.data.form.endDate);

      // 加载该项目成果数量（我的成果）
      this.loadResultCount(id);
    } catch (err) {
      console.error("加载项目详情失败:", err);
    }
  },

  async loadResultCount(projectId) {
    try {
      const res = await resultApi.getMyList({
        page: 1,
        pageSize: 1,
        projectId,
      });
      this.setData({ resultCount: Number(res.total) || 0 });
    } catch (err) {
      console.error("加载成果数量失败:", err);
      this.setData({ resultCount: 0 });
    }
  },

  // 输入框变化
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: e.detail.value,
    });
  },

  // 主题选择
  onThemeChange(e) {
    const index = e.detail.value;
    this.setData({
      "form.theme": this.data.themeOptions[index],
    });
  },

  // 开始日期
  onStartDateChange(e) {
    this.setData({
      "form.startDate": e.detail.value,
    });
  },

  // 结束日期
  onEndDateChange(e) {
    this.setData({
      "form.endDate": e.detail.value,
    });
  },

  // 表单验证
  validateForm() {
    const { form } = this.data;
    if (!form.title.trim()) {
      wx.showToast({ title: "请输入项目名称", icon: "none" });
      return false;
    }
    if (!form.theme) {
      wx.showToast({ title: "请选择项目主题", icon: "none" });
      return false;
    }
    if (!form.location.trim()) {
      wx.showToast({ title: "请输入实践地点", icon: "none" });
      return false;
    }
    if (!form.startDate || !form.endDate) {
      wx.showToast({ title: "请选择实践时间", icon: "none" });
      return false;
    }
    if (!form.leader.trim()) {
      wx.showToast({ title: "请输入负责人姓名", icon: "none" });
      return false;
    }
    if (!form.phone.trim()) {
      wx.showToast({ title: "请输入联系电话", icon: "none" });
      return false;
    }
    if (!form.description.trim()) {
      wx.showToast({ title: "请输入项目简介", icon: "none" });
      return false;
    }
    return true;
  },

  // 提交申报
  submitForm() {
    if (!this.validateForm()) return;

    wx.showModal({
      title: "确认提交",
      content: "提交后将进入审核流程，是否确认提交？",
      success: async (res) => {
        if (res.confirm) {
          this.setData({ submitting: true });
          try {
            const { form, id, mode } = this.data;
            const data = {
              title: form.title,
              category: form.theme,
              description: form.description,
              targetArea: form.location,
              startDate: form.startDate,
              endDate: form.endDate,
              budget: parseFloat(form.budget) || 0,
              teacherId: form.teacherId || null,
              members: form.members,
              plan: form.plan,
              expected_result: form.expectedResult,
            };

            // 调试日志
            debug.formData(data, "提交项目数据");

            if (mode === "create") {
              await projectApi.create(data);
            } else {
              await projectApi.update(id, data);
              // 如果是编辑（通常是驳回后重新提交），需要调用提交接口更新状态并触发通知
              await projectApi.submit(id);
            }

            wx.showToast({ title: "提交成功", icon: "success" });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } catch (err) {
            console.error("提交失败:", err);
            // 显示更详细的错误信息
            const errorMessage = err?.message || err?.msg || "提交失败，请重试";
            wx.showToast({
              title: errorMessage,
              icon: "none",
              duration: 3000,
            });
          } finally {
            this.setData({ submitting: false });
          }
        }
      },
    });
  },

  goToResult() {
    const { id } = this.data;
    if (!id) {
      wx.showToast({ title: "项目ID不能为空", icon: "none" });
      return;
    }

    if (!this.data.canSubmitResult) {
      wx.showToast({ title: "当前角色不可提交成果", icon: "none" });
      return;
    }

    const status = this.data.detail && this.data.detail.status;
    if (status !== "approved" && status !== "school_approved") {
      wx.showToast({ title: "项目未通过审核，不能提交成果", icon: "none" });
      return;
    }

    wx.navigateTo({
      url: `/pages/result/detail?mode=create&projectId=${id}`,
    });
  },

  goToResultList() {
    const { id } = this.data;
    if (!id) {
      wx.showToast({ title: "项目ID不能为空", icon: "none" });
      return;
    }
    const title = (this.data.detail && this.data.detail.title) || "";
    wx.navigateTo({
      url: `/pages/result/project?projectId=${id}&title=${encodeURIComponent(
        title,
      )}`,
    });
  },

  // 进入编辑模式
  goToEdit() {
    const { id } = this.data;
    wx.redirectTo({
      url: `/pages/activity/apply-detail?id=${id}&mode=edit`,
    });
  },

  // 跳转到进度上传
  goToProgress() {
    const { id } = this.data;
    if (!id) {
      wx.showToast({ title: "项目ID不能为空", icon: "none" });
      return;
    }

    if (!this.data.canUploadProgress) {
      wx.showToast({ title: "当前角色不可上传进度", icon: "none" });
      return;
    }

    const status = this.data.detail && this.data.detail.status;
    if (status !== "approved" && status !== "school_approved") {
      wx.showToast({ title: "项目未通过审核，不能上传进度", icon: "none" });
      return;
    }

    wx.navigateTo({
      url: `/pages/progress/detail?mode=create&projectId=${id}`,
    });
  },

  closeProject() {
    const { id, detail } = this.data;
    if (!id) {
      wx.showToast({ title: "项目ID不能为空", icon: "none" });
      return;
    }
    if (!this.data.canCloseProject) {
      wx.showToast({ title: "当前角色不可结项", icon: "none" });
      return;
    }
    if (
      !detail ||
      (detail.status !== "approved" && detail.status !== "school_approved")
    ) {
      wx.showToast({ title: "仅已通过项目可结项", icon: "none" });
      return;
    }

    wx.showModal({
      title: "确认结项",
      content: "结项后将进入评优流程，是否确认结项？",
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await projectApi.close(id);
          wx.showToast({ title: "结项成功", icon: "success" });
          this.loadDetail(id);
        } catch (err) {
          console.error("结项失败:", err);
          wx.showToast({ title: "结项失败", icon: "none" });
        }
      },
    });
  },
});
