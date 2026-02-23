const { projectApi } = require("../../utils/api");

Page({
  data: {
    list: [],
    canCreate: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
  },

  onLoad() {
    const app = getApp();
    const canCreate = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("apply.create")
    );
    this.setData({ canCreate });
    this.loadList(true);
  },

  onShow() {
    const app = getApp();
    const canCreate = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("apply.create")
    );
    this.setData({ canCreate });
    // 返回列表时不自动刷新，避免接口偶发为空导致列表被清空
  },

  onPullDownRefresh() {
    this.loadList(true);
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList(false);
    }
  },

  // 加载申报列表
  async loadList(refresh = false) {
    if (this.data.loading) return;

    const currentPage = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await projectApi.getList({
        page: currentPage,
        pageSize: this.data.pageSize,
      });

      console.log("接口返回数据示例:", res.list?.[0]);

      const statusMap = {
        draft: "草稿",
        pending: "待学院审核",
        college_approved: "待校级审核",
        school_approved: "审核通过",
        approved: "审核通过",
        closed: "已结项",
        completed: "已结项",
        rejected: "已驳回",
      };

      const rawList = Array.isArray(res.list) ? res.list : [];
      const newList = rawList.map((item) => {
        console.log("处理项目数据:", {
          leader_name: item.leader_name,
          target_area: item.target_area,
          members_count: item.members_count,
        });

        return {
          ...item,
          statusText: statusMap[item.status] || item.status,
          createTime: item.created_at ? item.created_at.slice(0, 10) : "",
        };
      });

      this.setData({
        list: refresh ? newList : [...this.data.list, ...newList],
        page: currentPage + 1,
        hasMore: newList.length === this.data.pageSize,
      });
    } catch (err) {
      console.error("加载项目列表失败:", err);
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 新建申报
  createNew() {
    wx.navigateTo({
      url: "/pages/activity/apply-detail?mode=create",
    });
  },

  // 查看详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    const mode = status === "pending" ? "edit" : "view";
    wx.navigateTo({
      url: `/pages/activity/apply-detail?id=${id}&mode=${mode}`,
    });
  },

  // 编辑项目
  goEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity/apply-detail?id=${id}&mode=edit`,
    });
  },
});
