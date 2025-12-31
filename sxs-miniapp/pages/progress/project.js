const { progressApi, projectApi } = require("../../utils/api");
const { BASE_URL } = require("../../utils/request");

Page({
  data: {
    projectId: "",
    title: "",
    projectStatus: "",
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
      title: title ? decodeURIComponent(title) : "项目进度",
    });

    this.loadProjectStatus(projectId);
    this.loadList();
  },

  async loadProjectStatus(projectId) {
    try {
      const res = await projectApi.getDetail(projectId);
      this.setData({ projectStatus: res.status || "" });
    } catch (err) {
      console.error("加载项目状态失败:", err);
    }
  },

  onPullDownRefresh() {
    this.loadList();
  },

  async loadList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await progressApi.getList({
        projectId: this.data.projectId,
        page: 1,
        pageSize: 50,
      });

      const baseUrl = BASE_URL.replace("/api", "");
      const list = (res.list || []).map((item) => ({
        ...item,
        date: item.progress_date ? item.progress_date.slice(0, 10) : "",
        summary: item.content ? item.content.slice(0, 100) : "",
        images: (item.images || []).map((img) =>
          img.startsWith("http") ? img : baseUrl + img
        ),
        imageCount: (item.images || []).length,
      }));

      this.setData({ list });
    } catch (err) {
      console.error("加载项目进度失败:", err);
      wx.showToast({ title: "加载失败", icon: "none" });
      this.setData({ list: [] });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  addProgress() {
    const { projectId } = this.data;
    if (!projectId) return;

    if (this.data.projectStatus !== "approved") {
      wx.showToast({ title: "项目未通过审核，不能上传进度", icon: "none" });
      return;
    }

    wx.navigateTo({
      url: `/pages/progress/detail?mode=create&projectId=${projectId}`,
    });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/progress/detail?id=${id}&mode=view`,
    });
  },
});
