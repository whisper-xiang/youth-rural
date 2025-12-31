const { resultApi, projectApi } = require("../../utils/api");

Page({
  data: {
    projectId: "",
    title: "",
    status: "",
    list: [],
    loading: false,
  },

  onLoad(options) {
    const { projectId, title } = options;
    this.setData({
      projectId: projectId || "",
      title: title ? decodeURIComponent(title) : "",
    });

    if (!projectId) {
      wx.showToast({ title: "缺少项目ID", icon: "none" });
      return;
    }

    wx.setNavigationBarTitle({
      title: title ? decodeURIComponent(title) : "项目成果",
    });

    this.loadProject(projectId);
    this.loadList(true);
  },

  onPullDownRefresh() {
    this.loadList(true);
  },

  async loadProject(projectId) {
    try {
      const res = await projectApi.getDetail(projectId);
      this.setData({ status: res.status || "" });
    } catch (err) {
      console.error("加载项目状态失败:", err);
    }
  },

  async loadList(refresh = false) {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await resultApi.getMyList({
        page: 1,
        pageSize: 50,
        projectId: this.data.projectId,
      });

      const list = (res.list || []).map((item) => ({
        ...item,
        submitDate: item.created_at ? item.created_at.slice(0, 10) : "",
        summary: item.content ? item.content.slice(0, 100) : "",
      }));

      this.setData({ list });
    } catch (err) {
      console.error("加载项目成果失败:", err);
      wx.showToast({ title: "加载失败", icon: "none" });
      this.setData({ list: [] });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  addResult() {
    if (this.data.status !== "approved") {
      wx.showToast({ title: "项目未通过审核，不能提交成果", icon: "none" });
      return;
    }

    wx.navigateTo({
      url: `/pages/result/detail?mode=create&projectId=${this.data.projectId}`,
    });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/result/detail?id=${id}&mode=view`,
    });
  },
});
