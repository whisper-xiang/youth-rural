const { progressApi, projectApi } = require("../../utils/api");

Page({
  data: {
    projects: [],
    loading: false,
  },

  onLoad() {
    // 检查登录状态
    const token = wx.getStorageSync("token");
    if (!token) {
      wx.showToast({
        title: "请先登录",
        icon: "none",
      });
      setTimeout(() => {
        wx.navigateTo({
          url: "/pages/auth/login",
        });
      }, 1500);
      return;
    }

    this.loadProjects();
  },

  onShow() {
    this.loadProjects();
  },

  onPullDownRefresh() {
    this.loadProjects();
  },

  // 加载项目列表
  async loadProjects() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      console.log("开始加载项目列表...");
      const res = await projectApi.getList({
        page: 1,
        pageSize: 100,
      });

      console.log("项目列表响应:", res);

      if (!res || !res.list) {
        console.error("项目列表响应格式错误:", res);
        this.setData({ projects: [] });
        return;
      }

      const projects = res.list.map((project) => ({
        ...project,
        progress_count: Number(project.progress_count) || 0,
        start_date: project.start_date ? project.start_date.slice(0, 10) : "",
        end_date: project.end_date ? project.end_date.slice(0, 10) : "",
        statusText: this.getStatusText(project.status),
      }));

      console.log("处理后的项目列表:", projects);

      this.setData({ projects });
    } catch (err) {
      console.error("加载项目列表失败:", err);
      wx.showToast({
        title: "加载失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      pending: "待学院审核",
      college_approved: "待校级审核",
      school_approved: "审核通过",
      approved: "审核通过",
      closed: "已结项",
      rejected: "已驳回",
    };
    return statusMap[status] || status;
  },

  // 进入某个项目的进度列表页
  goProject(e) {
    const projectId = e.currentTarget.dataset.id;
    const title = e.currentTarget.dataset.title;
    if (!projectId) return;
    wx.navigateTo({
      url: `/pages/progress/project?projectId=${projectId}&title=${encodeURIComponent(
        title || ""
      )}`,
    });
  },
});
