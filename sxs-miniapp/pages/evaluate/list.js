const { evaluationApi } = require("../../utils/api");

Page({
  data: {
    currentTab: "all",
    list: [],
    filteredList: [],
    tabName: "全部",
    canView: false,
    canScore: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
  },

  onLoad() {
    const app = getApp();
    const canView = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("evaluate.view")
    );
    const canScore = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("evaluate.score")
    );
    this.setData({ canView, canScore });

    if (!canView) {
      wx.showToast({ title: "无权限查看评优管理", icon: "none" });
      return;
    }

    this.loadList(true);
  },

  onShow() {
    const app = getApp();
    const canView = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("evaluate.view")
    );
    const canScore = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("evaluate.score")
    );
    this.setData({ canView, canScore });

    if (canView) {
      this.loadList(true);
    }
  },

  onPullDownRefresh() {
    this.loadList(true);
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList(false);
    }
  },

  // 加载评优列表
  async loadList(refresh = false) {
    if (this.data.loading) return;

    const { currentTab, pageSize } = this.data;
    const currentPage = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await evaluationApi.getList({
        page: currentPage,
        pageSize,
        status: currentTab === "all" ? "" : currentTab,
      });

      const newList = res.list.map((item) => ({
        ...item,
        statusText: item.is_evaluated ? "已评审" : "待评审",
        status: item.is_evaluated ? "evaluated" : "pending",
        myScore: item.my_score,
        leaderName: item.leader_name || "",
        college: item.college_name || "",
        theme: item.category || "",
      }));

      const mergedList = refresh ? newList : [...this.data.list, ...newList];
      const filteredList = this.buildFilteredList(mergedList, currentTab);

      this.setData({
        list: mergedList,
        filteredList,
        tabName: this.getTabName(currentTab),
        page: currentPage + 1,
        hasMore: newList.length === pageSize,
      });
    } catch (err) {
      console.error("加载评优列表失败:", err);

      const msg = (err && (err.message || err.msg)) || "";
      if (msg.includes("403") || msg.includes("无权限")) {
        wx.showToast({ title: "无权限查看评优管理", icon: "none" });
      } else {
        wx.showToast({ title: "加载评优列表失败", icon: "none" });
      }

      if (refresh) {
        this.setData({ list: [], filteredList: [], hasMore: false });
      }
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    this.setData({
      currentTab: tab,
      list: [],
      filteredList: [],
      page: 1,
      hasMore: true,
      tabName: this.getTabName(tab),
    });
    this.loadList(true);
  },

  getTabName(tab) {
    const map = {
      all: "全部",
      pending: "待评审",
      evaluated: "已评审",
    };
    return map[tab] || "全部";
  },

  buildFilteredList(list, tab) {
    if (!Array.isArray(list)) return [];
    if (!tab || tab === "all") return list;
    return list.filter((i) => i && i.status === tab);
  },

  // 查看详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    const projectId = e.currentTarget.dataset.projectId;
    const targetId = projectId || id;
    wx.navigateTo({
      url: `/pages/evaluate/detail?id=${targetId}`,
    });
  },
});
