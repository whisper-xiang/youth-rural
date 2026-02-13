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
    // 每次显示时刷新列表
    this.loadList(true);
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

      const statusMap = {
        pending: "待学院审核",
        college_approved: "待校级审核",
        school_approved: "审核通过",
        approved: "审核通过",
        closed: "已结项",
        rejected: "已驳回",
        withdrawn: "已撤回",
      };

      const newList = res.list.map((item) => ({
        ...item,
        statusText: statusMap[item.status] || item.status,
        createTime: item.created_at ? item.created_at.slice(0, 10) : "",
      }));

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

    // 如果项目已立项（approved / school_approved / closed），进入工作台
    if (["approved", "school_approved", "closed"].includes(status)) {
      wx.navigateTo({
        url: `/pages/project/workspace?id=${id}`,
      });
    } else {
      // 否则进入申请详情页（查看审核状态或重新编辑提交）
      wx.navigateTo({
        url: `/pages/activity/apply-detail?id=${id}&mode=view`,
      });
    }
  },
});
