const { projectApi } = require("../../utils/api");

Page({
  data: {
    projects: [],
    canSubmit: false,
    loading: false,
  },

  onLoad() {
    const app = getApp();
    const canSubmit = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("result.submit")
    );
    this.setData({ canSubmit });

    // 检查登录状态
    const token = wx.getStorageSync("token");
    if (!token) {
      wx.showToast({ title: "请先登录", icon: "none" });
      setTimeout(() => {
        wx.navigateTo({ url: "/pages/auth/login" });
      }, 1500);
      return;
    }

    this.loadProjects();
  },

  onShow() {
    const app = getApp();
    const canSubmit = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("result.submit")
    );
    this.setData({ canSubmit });

    this.loadProjects();
  },

  onPullDownRefresh() {
    this.loadProjects();
  },

  // 加载项目列表（我有权限看到的项目）
  async loadProjects() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await projectApi.getList({ page: 1, pageSize: 100 });
      if (!res || !res.list) {
        this.setData({ projects: [] });
        return;
      }

      const projects = res.list.map((p) => ({
        ...p,
        my_result_count: Number(p.my_result_count) || 0,
        start_date: p.start_date ? p.start_date.slice(0, 10) : "",
        end_date: p.end_date ? p.end_date.slice(0, 10) : "",
        statusText: this.getStatusText(p.status),
      }));

      this.setData({ projects });
    } catch (err) {
      console.error("加载项目列表失败:", err);
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  getStatusText(status) {
    const statusMap = {
      draft: "草稿",
      pending: "待学院审核",
      college_approved: "待校级审核",
      school_approved: "审核通过",
      approved: "审核通过",
      closed: "已结项",
      rejected: "已驳回",
    };
    return statusMap[status] || status;
  },

  // 提交成果
  addResult() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: "当前角色不可提交成果", icon: "none" });
      return;
    }

    const approvedProjects = this.data.projects.filter(
      (p) => p && p.status === "approved"
    );
    if (approvedProjects.length === 0) {
      wx.showToast({ title: "暂无已通过项目，不能提交成果", icon: "none" });
      return;
    }

    wx.showActionSheet({
      itemList: approvedProjects.map((p) => p.title),
      success: (res) => {
        const project = approvedProjects[res.tapIndex];
        wx.navigateTo({
          url: `/pages/result/detail?mode=create&projectId=${project.id}`,
        });
      },
    });
  },

  // 进入某个项目的成果列表页
  goProject(e) {
    const projectId = e.currentTarget.dataset.id;
    const title = e.currentTarget.dataset.title;
    if (!projectId) return;
    wx.navigateTo({
      url: `/pages/result/project?projectId=${projectId}&title=${encodeURIComponent(
        title || ""
      )}`,
    });
  },
});
