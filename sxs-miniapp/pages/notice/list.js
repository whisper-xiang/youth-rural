const { noticeApi } = require("../../utils/api");

Page({
  data: {
    currentTab: "all",
    tabName: "",
    canPublish: false,
    list: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
  },

  onLoad() {
    const app = getApp();
    const canPublish = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("notice.publish")
    );
    this.setData({ canPublish });
    this.loadList(true);
  },

  onShow() {
    const app = getApp();
    const canPublish = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("notice.publish")
    );
    this.setData({ canPublish });
    // 返回时刷新列表
    this.loadList(true);
  },

  goCreate() {
    if (!this.data.canPublish) {
      wx.showToast({ title: "无权限发布通知", icon: "none" });
      return;
    }
    wx.navigateTo({ url: "/pages/notice/create" });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadList(true);
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList(false);
    }
  },

  // 加载通知列表
  async loadList(refresh = false) {
    if (this.data.loading) return;

    const { currentTab, page, pageSize } = this.data;
    const currentPage = refresh ? 1 : page;

    this.setData({ loading: true });

    try {
      const type = currentTab === "all" ? "" : currentTab;
      const res = await noticeApi.getList({
        page: currentPage,
        pageSize,
        type,
      });

      // 格式化数据
      const newList = res.list.map((item) => ({
        ...item,
        typeName: this.getTypeName(item.type),
        publishTime: item.publish_time ? item.publish_time.slice(0, 10) : "",
        isTop: item.is_top === 1,
        isRead: item.is_read === 1,
      }));

      this.setData({
        list: refresh ? newList : [...this.data.list, ...newList],
        page: currentPage + 1,
        hasMore: newList.length === pageSize,
      });
    } catch (err) {
      console.error("加载通知列表失败:", err);
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 获取类型名称
  getTypeName(type) {
    const map = { notice: "通知", policy: "政策", activity: "活动" };
    return map[type] || "通知";
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;

    this.setData({
      currentTab: tab,
      list: [],
      page: 1,
      hasMore: true,
    });
    this.loadList(true);
  },

  // 查看详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    // 本地标记已读
    const list = this.data.list.map((item) => {
      if (item.id === id) {
        return { ...item, isRead: true };
      }
      return item;
    });
    this.setData({ list });

    wx.navigateTo({
      url: `/pages/notice/detail?id=${id}`,
    });
  },
});
